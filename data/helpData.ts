import type { TourStep, FaqItem, Tutorial } from '../types';

export const tourSteps: TourStep[] = [
  {
    selector: '.sidebar-nav',
    titleKey: 'onboarding.tour.step1_title',
    contentKey: 'onboarding.tour.step1_content',
  },
  {
    selector: '.header-controls',
    titleKey: 'onboarding.tour.step2_title',
    contentKey: 'onboarding.tour.step2_content',
  },
];

export const MOCK_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    question: {
      en: 'How do I change the language?',
      ar: 'كيف أغيّر اللغة؟',
      tr: 'Dili nasıl değiştiririm?',
    },
    answer: {
      en: 'Use the globe icon in the header.',
      ar: 'استخدم رمز الكرة في الترويسة.',
      tr: 'Başlıktaki simgeyi kullanın.',
    },
  },
  {
    id: 'faq-2',
    category: 'general',
    question: {
      en: 'How do I customize the dashboard?',
      ar: 'كيف أخصص لوحة القيادة؟',
      tr: 'Paneli nasıl özelleştiririm?',
    },
    answer: {
      en: 'Open Customize from dashboard controls to show or hide widgets.',
      ar: 'افتح «تخصيص» لإظهار أو إخفاء الأدوات.',
      tr: "Kontrol panelinde 'Özelleştir' ile widget'ları yönetin.",
    },
  },
];

export const MOCK_TUTORIALS: Tutorial[] = [
  {
    id: 'tut-1',
    title: { en: 'First project', ar: 'مشروع أول', tr: 'İlk proje' },
    description: { en: 'Short demo (no large video in dev).', ar: 'تجريبي', tr: 'Demo' },
    duration: 3,
    type: 'interactive',
  },
  {
    id: 'tut-2',
    title: { en: 'Dashboard', ar: 'لوحة', tr: 'Panel' },
    description: { en: 'Layout and widgets overview.', ar: 'نظرة', tr: 'Genel bakış' },
    duration: 2,
    type: 'interactive',
  },
];
