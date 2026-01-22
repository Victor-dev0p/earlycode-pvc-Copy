import MyCoursesClient from './my-courses';

export const metadata = {
  title: 'My Courses - PVC',
  description: 'View your selected courses',
};

export default function MyCoursesPage() {
  return <MyCoursesClient />;
}