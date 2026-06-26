from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Dict, Optional
from ortools.sat.python import cp_model

app = FastAPI()

# --- 1. Pydantic Models (The Data We Receive) ---
class Subject(BaseModel):
    name: str
    code: str
    lectures_per_week: int
    urgency_score: Optional[float] = 0.0  # For adaptive scheduling
    adaptive_slots: Optional[int] = None  # Calculated adaptive slots

class Teacher(BaseModel):
    name: str

class SubjectTeacherPair(BaseModel):
    subject: Subject
    teacher: Teacher

class Classroom(BaseModel):
    name: str
    capacity: int

class ReservedSlot(BaseModel):
    # A (teacher or room) name that is already occupied at (day, slot) by
    # another class — used to keep timetables conflict-free ACROSS classes.
    name: str
    day: int
    slot: int

class TimetableInput(BaseModel):
    subject_teacher_pairs: List[SubjectTeacherPair]
    classrooms: List[Classroom]
    adaptive_mode: Optional[bool] = False  # Enable adaptive scheduling
    blocked_days: Optional[List[int]] = []  # Day indices to block (0=Mon, 1=Tue, ... 4=Fri)
    # Cross-class reservations: teacher/room (day,slot) pairs booked elsewhere.
    reserved_teacher_slots: Optional[List[ReservedSlot]] = []
    reserved_room_slots: Optional[List[ReservedSlot]] = []

# --- 2. Urgency-Based Slot Calculation ---
def calculate_adaptive_slots(urgency_score: float, base_lectures: int) -> int:
    """
    Calculate adaptive slot allocation based on urgency score.
    
    Urgency Levels:
    - Critical (>= 3.0): 5 slots
    - High (2.0-2.99): 4 slots
    - Moderate (1.0-1.99): 3 slots
    - Normal (< 1.0): 2 slots
    - Completed/Ahead (< 0): 1 slot (minimal for review)
    """
    if urgency_score >= 3.0:
        return min(5, base_lectures + 2)  # Critical - add 2 extra slots
    elif urgency_score >= 2.0:
        return min(4, base_lectures + 1)  # High - add 1 extra slot
    elif urgency_score >= 1.0:
        return base_lectures  # Moderate - keep base
    elif urgency_score >= 0.5:
        return max(2, base_lectures - 1)  # Low - reduce by 1
    else:
        return max(1, base_lectures - 2)  # Completed - minimal slots

# --- 3. The Main Solver Logic ---

@app.post("/generate")
def generate_timetable(data: TimetableInput):
    
    # --- A. DEFINE THE SCHEDULE ---
    num_days = 5
    num_slots_per_day = 8
    lunch_slot_index = 4 # Slot 4 is the 5th slot (0-indexed)
    blocked_days = data.blocked_days or []
    
    if blocked_days:
        day_names = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
        blocked_names = [day_names[d] for d in blocked_days if 0 <= d <= 4]
        print(f"🚫 BLOCKED DAYS: {blocked_names} (indices: {blocked_days})")
    else:
        print("📅 No blocked days - all weekdays available")
    
    # --- B. ADAPTIVE MODE PROCESSING ---
    if data.adaptive_mode:
        print("🎯 ADAPTIVE MODE ENABLED - Calculating dynamic slot allocation...")
        for pair in data.subject_teacher_pairs:
            urgency = pair.subject.urgency_score
            base_lectures = pair.subject.lectures_per_week
            adaptive_slots = calculate_adaptive_slots(urgency, base_lectures)
            pair.subject.adaptive_slots = adaptive_slots
            
            print(f"  {pair.subject.name}: Urgency={urgency:.2f}, Base={base_lectures}, Adaptive={adaptive_slots}")
    else:
        print("📅 STATIC MODE - Using fixed lectures_per_week")
        for pair in data.subject_teacher_pairs:
            pair.subject.adaptive_slots = pair.subject.lectures_per_week
    
    # --- C. FEASIBILITY CHECK ---
    if data.adaptive_mode:
        total_lectures_needed = sum(pair.subject.adaptive_slots for pair in data.subject_teacher_pairs)
    else:
        total_lectures_needed = sum(pair.subject.lectures_per_week for pair in data.subject_teacher_pairs)
    
    active_days = num_days - len(blocked_days)
    available_slots = active_days * (num_slots_per_day - 1)  # Minus lunch slot, minus blocked days
    num_pairs = len(data.subject_teacher_pairs)
    num_classrooms = len(data.classrooms)
    
    # Basic validation
    if num_pairs == 0:
        return {
            "status": "error",
            "message": "No subject-teacher assignments available. Please assign subjects to the class first."
        }
    
    if num_classrooms == 0:
        return {
            "status": "error",
            "message": "No classrooms available. Please add at least one classroom."
        }
    
    # Check if total lectures exceed available slots
    if total_lectures_needed > available_slots:
        return {
            "status": "error",
            "message": f"Too many lectures required! Need {total_lectures_needed} slots but only {available_slots} available (5 days × 7 slots after lunch). Please reduce lectures or urgency is too high."
        }
    
    # Warn if resources are tight
    resource_capacity = num_classrooms * available_slots
    if total_lectures_needed > resource_capacity * 0.7:
        print(f"⚠️ Warning: High resource utilization. {total_lectures_needed} lectures with {num_classrooms} rooms.")

    # --- D. PREPARE THE DATA ---
    all_pairs = data.subject_teacher_pairs
    all_classrooms = data.classrooms
    
    # Extract unique teachers for clash prevention
    all_teachers = list(set(pair.teacher.name for pair in all_pairs))

    # --- E. CREATE THE CP-SAT MODEL ---
    model = cp_model.CpModel()

    # --- F. CREATE VARIABLES ---
    # schedule_vars[(subject_code, teacher_name, room_name, day, slot)] = BoolVar
    schedule_vars = {}
    
    for pair in all_pairs:
        s_code = pair.subject.code
        t_name = pair.teacher.name
        for c in all_classrooms:
            for d in range(num_days):
                for sl in range(num_slots_per_day):
                    schedule_vars[(s_code, t_name, c.name, d, sl)] = model.NewBoolVar(
                        f"schedule_{s_code}_{t_name}_{c.name}_{d}_{sl}"
                    )

    # --- G. DEFINE THE CONSTRAINTS (THE RULES) ---

    # Rule 1: Adaptive Lecture Frequency
    # Each subject must be taught exactly `adaptive_slots` times (or lectures_per_week in static mode)
    for pair in all_pairs:
        s = pair.subject
        t = pair.teacher
        target_lectures = s.adaptive_slots if data.adaptive_mode else s.lectures_per_week
        
        model.Add(
            sum(
                schedule_vars[(s.code, t.name, c.name, d, sl)]
                for c in all_classrooms
                for d in range(num_days)
                for sl in range(num_slots_per_day)
            ) == target_lectures
        )

    # Rule 2: Teacher Clash Prevention
    for t_name in all_teachers:
        for d in range(num_days):
            for sl in range(num_slots_per_day):
                relevant_vars = [
                    schedule_vars[(pair.subject.code, t_name, c.name, d, sl)]
                    for pair in all_pairs
                    if pair.teacher.name == t_name
                    for c in all_classrooms
                ]
                if relevant_vars:
                    model.Add(sum(relevant_vars) <= 1)

    # Rule 3: Classroom Clash Prevention
    for c in all_classrooms:
        for d in range(num_days):
            for sl in range(num_slots_per_day):
                relevant_vars = [
                    schedule_vars[(pair.subject.code, pair.teacher.name, c.name, d, sl)]
                    for pair in all_pairs
                ]
                model.Add(sum(relevant_vars) <= 1)

    # Rule 4: Lunch Break
    for pair in all_pairs:
        for c in all_classrooms:
            for d in range(num_days):
                model.Add(
                    schedule_vars[(pair.subject.code, pair.teacher.name, c.name, d, lunch_slot_index)] == 0
                )

    # Rule 5: Teacher Cool-Down (max 2 consecutive classes)
    is_teacher_busy = {}
    for t_name in all_teachers:
        for d in range(num_days):
            for sl in range(num_slots_per_day):
                is_busy = model.NewBoolVar(f"busy_{t_name}_{d}_{sl}")
                is_teacher_busy[(t_name, d, sl)] = is_busy
                
                relevant_vars = [
                    schedule_vars[(pair.subject.code, t_name, c.name, d, sl)]
                    for pair in all_pairs
                    if pair.teacher.name == t_name
                    for c in all_classrooms
                ]
                
                if relevant_vars:
                    classes_in_slot = sum(relevant_vars)
                    model.Add(classes_in_slot == 1).OnlyEnforceIf(is_busy)
                    model.Add(classes_in_slot == 0).OnlyEnforceIf(is_busy.Not())
                else:
                    model.Add(is_busy == 0)

    # Apply cooldown - no more than 2 consecutive classes
    for t_name in all_teachers:
        for d in range(num_days):
            for sl in range(num_slots_per_day - 2):
                busy_slot1 = is_teacher_busy[(t_name, d, sl)]
                busy_slot2 = is_teacher_busy[(t_name, d, sl + 1)]
                busy_slot3 = is_teacher_busy[(t_name, d, sl + 2)]
                model.AddBoolOr([busy_slot1.Not(), busy_slot2.Not(), busy_slot3.Not()])

    # Rule 6: Blocked Days (Holidays)
    # Force all variables to 0 on blocked days
    if blocked_days:
        for pair in all_pairs:
            for c in all_classrooms:
                for blocked_d in blocked_days:
                    if 0 <= blocked_d <= 4:
                        for sl in range(num_slots_per_day):
                            model.Add(
                                schedule_vars[(pair.subject.code, pair.teacher.name, c.name, blocked_d, sl)] == 0
                            )
        print(f"✅ Applied holiday constraints for {len(blocked_days)} blocked day(s)")

    # Rule 7: Cross-class reservations
    # A teacher already teaching another class at (d, sl) cannot be placed here;
    # a room already in use by another class at (d, sl) cannot be used here.
    reserved_teachers = {(r.name, r.day, r.slot) for r in (data.reserved_teacher_slots or [])}
    reserved_rooms = {(r.name, r.day, r.slot) for r in (data.reserved_room_slots or [])}
    if reserved_teachers or reserved_rooms:
        for pair in all_pairs:
            s_code = pair.subject.code
            t_name = pair.teacher.name
            for c in all_classrooms:
                for d in range(num_days):
                    for sl in range(num_slots_per_day):
                        if (t_name, d, sl) in reserved_teachers or (c.name, d, sl) in reserved_rooms:
                            model.Add(schedule_vars[(s_code, t_name, c.name, d, sl)] == 0)
        print(f"🔒 Applied {len(reserved_teachers)} teacher + {len(reserved_rooms)} room cross-class reservations")

    # --- H. SOLVE THE MODEL ---
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30.0
    solver.parameters.log_search_progress = False
    status = solver.Solve(model)
    
    print(f"✅ Solver status: {solver.StatusName(status)}")
    print(f"⏱️  Solve time: {solver.WallTime():.2f} seconds")

    # --- I. RETURN THE RESULT ---
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        # Reconstruct the schedule
        solution = []
        allocation_summary = []  # NEW: Track allocation for each subject
        
        for pair in all_pairs:
            target_slots = pair.subject.adaptive_slots if data.adaptive_mode else pair.subject.lectures_per_week
            allocation_summary.append({
                "subject": pair.subject.name,
                "code": pair.subject.code,
                "urgency_score": pair.subject.urgency_score,
                "base_lectures": pair.subject.lectures_per_week,
                "allocated_slots": target_slots,
                "mode": "adaptive" if data.adaptive_mode else "static"
            })
        
        for d in range(num_days):
            day_schedule = []
            is_blocked = d in blocked_days
            for sl in range(num_slots_per_day):
                slot_info = []
                
                # Check for Holiday (blocked day)
                if is_blocked:
                    slot_info.append({"event": "Holiday 🎉"})
                    day_schedule.append(slot_info)
                    continue
                
                # Check for Lunch
                if sl == lunch_slot_index:
                    slot_info.append({"event": "Lunch Break"})
                
                # Check for Classes
                for pair in all_pairs:
                    s = pair.subject
                    t = pair.teacher
                    for c in all_classrooms:
                        if solver.Value(schedule_vars[(s.code, t.name, c.name, d, sl)]) == 1:
                            slot_info.append({
                                "subject": s.name,
                                "teacher": t.name,
                                "classroom": c.name,
                                "urgency": s.urgency_score if data.adaptive_mode else None
                            })
                day_schedule.append(slot_info)
            solution.append(day_schedule)
        
        return {
            "status": "success",
            "message": "Timetable generated successfully!" + (" (Adaptive Mode)" if data.adaptive_mode else ""),
            "timetable": solution,
            "adaptive_mode": data.adaptive_mode,
            "allocation_summary": allocation_summary,  # NEW: Show how slots were allocated
            "statistics": {
                "total_lectures_allocated": total_lectures_needed,
                "available_slots": available_slots,
                "utilization_rate": round((total_lectures_needed / available_slots) * 100, 2)
            }
        }
    else:
        error_details = {
            "total_lectures_needed": total_lectures_needed,
            "available_slots": available_slots,
            "num_subject_teacher_pairs": num_pairs,
            "num_classrooms": num_classrooms,
            "solver_status": solver.StatusName(status)
        }
        
        if status == cp_model.INFEASIBLE:
            if total_lectures_needed > available_slots * 0.8:
                message = f"Schedule is over-constrained. You need {total_lectures_needed} lecture slots but only {available_slots} available (after lunch break). Consider reducing lectures_per_week for some subjects."
            else:
                message = f"Cannot create a valid schedule with current constraints. Try adding more classrooms ({num_classrooms} available) or reducing the lectures_per_week requirement."
        elif status == cp_model.MODEL_INVALID:
            message = "Internal error: The scheduling model is invalid. Please contact support."
        else:
            message = f"Solver timeout or unknown issue (status: {solver.StatusName(status)}). The problem might be too complex. Try simplifying the schedule."
        
        return {
            "status": "error",
            "message": message,
            "details": error_details
        }

@app.get("/")
def read_root():
    return {"message": "AI Solver Service with Adaptive Scheduling is running!"}
