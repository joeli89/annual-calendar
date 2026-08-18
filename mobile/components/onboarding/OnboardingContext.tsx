/**
 * Intent: App-wide access to the onboarding bottom sheet.
 * Why: The save gate lives on the event screen, but Saved and Profile also
 * trigger sign-in — one host renders the sheet so every entry point behaves
 * identically and no screen ever full-screen-navigates to auth.
 */
import {
  BottomSheetBackdrop,
  BottomSheetModal,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet';
import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { StyleSheet } from 'react-native';

import { track } from '../../lib/analytics';
import { OnboardingSheet, type OnboardingStep } from './OnboardingSheet';
import { onboardingTokens as t } from './tokens';

type OnboardingContextValue = {
  /** Present the onboarding sheet (no-op if already presented). */
  openOnboarding: () => void;
};

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

const SNAP_POINTS = ['93%'];

function Backdrop(props: BottomSheetBackdropProps) {
  return (
    <BottomSheetBackdrop
      {...props}
      appearsOnIndex={0}
      disappearsOnIndex={-1}
      pressBehavior="close"
    />
  );
}

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const modalRef = useRef<BottomSheetModal>(null);
  // Remount the sheet content per presentation so step state starts fresh.
  const [sessionKey, setSessionKey] = useState(0);
  const sessionRef = useRef<{ step: OnboardingStep; completed: boolean }>({
    step: 'auth',
    completed: false,
  });

  const openOnboarding = useCallback(() => {
    sessionRef.current = { step: 'auth', completed: false };
    setSessionKey((k) => k + 1);
    modalRef.current?.present();
  }, []);

  const dismiss = useCallback(() => {
    modalRef.current?.dismiss();
  }, []);

  const handleDismiss = useCallback(() => {
    if (!sessionRef.current.completed) {
      track('onboarding_abandoned', { last_step: sessionRef.current.step });
    }
  }, []);

  return (
    <OnboardingContext.Provider value={{ openOnboarding }}>
      {children}
      <BottomSheetModal
        ref={modalRef}
        snapPoints={SNAP_POINTS}
        enablePanDownToClose
        enableDynamicSizing={false}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        backdropComponent={Backdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        onDismiss={handleDismiss}
      >
        <OnboardingSheet
          key={sessionKey}
          dismiss={dismiss}
          sessionRef={sessionRef}
        />
      </BottomSheetModal>
    </OnboardingContext.Provider>
  );
}

export function useOnboarding(): OnboardingContextValue {
  const ctx = useContext(OnboardingContext);
  if (!ctx) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return ctx;
}

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: t.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  handleIndicator: {
    backgroundColor: t.secondaryFill,
    width: 44,
  },
});
