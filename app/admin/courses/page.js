import CoursesClient from './courses';

export const metadata = {
  title: 'Courses - Admin - PVC',
  description: 'Manage courses',
};

export default function CoursesPage() {
  return <CoursesClient />;
}