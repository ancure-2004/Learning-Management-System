/**
 * Classes.jsx — redirects to AcademicResources with Classes tab active.
 * The AcademicResources page is the canonical home for subjects, classes, and classrooms.
 */
import AcademicResources from '@/pages/admin/AcademicResources';
const Classes = () => <AcademicResources defaultTab="classes" />;
export default Classes;
