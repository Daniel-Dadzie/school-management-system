import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { StudentAdapter } from '../lib/functional/adapters/student-adapter';
import { isMockMode } from '../lib/functional/config';
import type { StudentInput } from '../lib/functional/services/student-service';

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

export function useCreateStudent() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: StudentInput) => {
      if (!isMockMode) throw new Error('Student API is not available in API mode.');
      return StudentAdapter.create(input);
    },
    onSuccess: (student) => {
      client.invalidateQueries({ queryKey: ['students'] });
      client.setQueryData(['students', student.id], student);
      client.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });
}

export function useUpdateStudent(id: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<StudentInput>) => {
      if (!isMockMode) throw new Error('Student API is not available in API mode.');
      return StudentAdapter.update(id, input);
    },
    onSuccess: (student) => {
      client.invalidateQueries({ queryKey: ['students'] });
      client.setQueryData(['students', id], student);
      client.invalidateQueries({ queryKey: ['enrollments'] });
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
