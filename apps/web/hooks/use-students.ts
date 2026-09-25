import { useQuery } from '@tanstack/react-query';
import { StudentAdapter } from '../lib/functional/adapters/student-adapter';
import { isMockMode } from '../lib/functional/config';

export function useStudents() {
  return useQuery({
    queryKey: ['students'],
    queryFn: async () => {
      if (isMockMode) {
        return StudentAdapter.getStudents();
      }
      // Real API integration would go here
      throw new Error('Real API not implemented yet');
    },
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ['students', id],
    queryFn: async () => {
      if (isMockMode) {
        return StudentAdapter.getStudent(id);
      }
      throw new Error('Real API not implemented yet');
    },
    enabled: !!id,
  });
}
