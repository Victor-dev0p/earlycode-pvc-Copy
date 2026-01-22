import CreateCourseClient from './create';

export const metadata = {
  title: 'Create Course - Admin - PVC',
  description: 'Create a new course',
};

export default function CreateCoursePage() {
  return <CreateCourseClient />;
}