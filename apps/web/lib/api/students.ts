import { useQuery } from '@tanstack/react-query';
import { StudentAdapter } from '../functional/adapters/student-adapter';

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: () => StudentAdapter.getStudents(),
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: () => StudentAdapter.getStudent(id),
    enabled: !!id,
  });
}
