import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { create } from 'zustand';

import { invokeCreateModel, invokeListModels } from './commands';
import type { CommandError, Model, UnsavedModel } from './types';

export type BearState = {
  bears: number;
  increase: (by: number) => void;
};

export const useBearStore = create<BearState>((set) => ({
  bears: 0,
  increase: (by: number) => set((state) => ({ bears: state.bears + by })),
}));

export const LIST_MODELS_KEY = ['list-models'];

export function useCreateModel(): UseMutationResult<
  Model,
  CommandError,
  UnsavedModel
> {
  return useMutation({
    mutationFn: invokeCreateModel,
  });
}

export function useListModels(): UseQueryResult<Model[], CommandError> {
  return useQuery({
    queryKey: LIST_MODELS_KEY,
    queryFn: invokeListModels,
  });
}
