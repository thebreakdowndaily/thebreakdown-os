'use client';

import type { AuthorBoxBlockData } from './types';
import AuthorBox from '@/components/story/AuthorBox';

export default function AuthorBoxBlock(props: AuthorBoxBlockData) {
  return <AuthorBox author={props.author} />;
}
