'use client';

import React from 'react';
import SettingsModal from './SettingsModal';
import { Conversation } from '@/lib/types';

interface CustomiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedModel: string;
  onSelectModel: (model: string) => void;
  currentUser?: {
    username: string;
    email: string;
    provider: string;
  } | null;
  conversations?: Conversation[];
  onClearAll?: () => void;
  onOpenProfile?: () => void;
  onOpenAuthModal?: () => void;
}

export default function CustomiseModal({
  isOpen,
  onClose,
  selectedModel,
  onSelectModel,
  currentUser,
  conversations,
  onClearAll,
  onOpenProfile,
  onOpenAuthModal,
}: CustomiseModalProps) {
  return (
    <SettingsModal
      isOpen={isOpen}
      onClose={onClose}
      selectedModel={selectedModel}
      onSelectModel={onSelectModel}
      currentUser={currentUser}
      conversations={conversations}
      onClearAll={onClearAll}
      onOpenProfile={onOpenProfile}
      onOpenAuthModal={onOpenAuthModal}
    />
  );
}
