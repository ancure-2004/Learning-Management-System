/**
 * Subjects.jsx — redirects to AcademicResources with Subjects tab active.
 * The AcademicResources page is the canonical home for subjects, classes, and classrooms.
 */
import AcademicResources from '@/pages/admin/AcademicResources';
const Subjects = () => <AcademicResources defaultTab="subjects" />;
export default Subjects;
