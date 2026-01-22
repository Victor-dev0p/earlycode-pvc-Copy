import BrowseCoursesClient from './courses';

export const metadata = {
  title: 'Browse Courses - PVC',
  description: 'Explore available courses',
};

export default function BrowseCoursesPage() {
  return <BrowseCoursesClient />;
}