/**
 * Classrooms.jsx — redirects to AcademicResources with Classrooms tab active.
 * The AcademicResources page is the canonical home for subjects, classes, and classrooms.
 */
import AcademicResources from '@/pages/admin/AcademicResources';
const Classrooms = () => <AcademicResources defaultTab="classrooms" />;
export default Classrooms;
