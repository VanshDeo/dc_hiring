"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SplitLayout } from '../components/layout/SplitLayout';
import { StepIndicator } from '../components/ui/StepIndicator';
import { Button } from '../components/ui/Button';
import { Step1About } from '../components/steps/Step1About';
import { Step2Interests } from '../components/steps/Step2Interests';
import { Step3Experience } from '../components/steps/Step3Experience';
import { Step4Contribution } from '../components/steps/Step4Contribution';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Home() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  const [isHydrated, setIsHydrated] = useState(false);
  const storageKey = 'dc-hiring-form-state';
  const submittedKey = 'dc-hiring-form-submitted';

  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    location: '',
    accommodation: '',
    twitter: '',
    discord: '',
    linkedin: '',
    github: '',
    resumeFilename: '',
    resumeBase64: '',
  });

  const [interests, setInterests] = useState<string[]>([]);
  const [otherInterest, setOtherInterest] = useState('');
  const [developmentSelections, setDevelopmentSelections] = useState<string[]>([]);

  const [experience, setExperience] = useState({
    familiarity: '',
    excites: '',
    whyJoin: '',
  });

  const [contribution, setContribution] = useState({
    proud: '',
    timeCommit: '',
  });

  useEffect(() => {
    const hasSubmitted = window.localStorage.getItem(submittedKey) === 'true';

    if (hasSubmitted) {
      router.replace('/submitted');
      return;
    }

    const savedState = window.localStorage.getItem(storageKey);

    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);

        if (typeof parsed.currentStep === 'number') setCurrentStep(parsed.currentStep);
        if (parsed.formData) setFormData(parsed.formData);
        if (Array.isArray(parsed.interests)) setInterests(parsed.interests);
        if (typeof parsed.otherInterest === 'string') setOtherInterest(parsed.otherInterest);
        if (Array.isArray(parsed.developmentSelections)) {
          setDevelopmentSelections(parsed.developmentSelections);
        } else if (typeof parsed.developmentType === 'string' && parsed.developmentType) {
          setDevelopmentSelections([parsed.developmentType]);
        }
        if (parsed.experience) setExperience(parsed.experience);
        if (parsed.contribution) setContribution(parsed.contribution);
        // Migration: ensure resume fields exist
        if (parsed.formData && typeof parsed.formData.resumeFilename === 'string') {
          setFormData((prev) => ({ ...prev, resumeFilename: parsed.formData.resumeFilename }));
        }
        if (parsed.formData && typeof parsed.formData.resumeBase64 === 'string') {
          setFormData((prev) => ({ ...prev, resumeBase64: parsed.formData.resumeBase64 }));
        }
      } catch (error) {
        console.warn('Failed to restore saved form state:', error);
      }
    }

    setIsHydrated(true);
  }, [router, submittedKey]);

  useEffect(() => {
    if (!isHydrated) return;

    window.localStorage.setItem(
      storageKey,
      JSON.stringify({
        currentStep,
        formData,
        interests,
        otherInterest,
        developmentSelections,
        experience,
        contribution,
      })
    );
  }, [isHydrated, currentStep, formData, interests, otherInterest, developmentSelections, experience, contribution]);

  useEffect(() => {
    if (!isHydrated) return;

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep, isHydrated]);

  const handleNext = async () => {
    // Validate current step before proceeding
    const validateFn = (window as any)[`__step${currentStep}Validate`];

    if (validateFn && !validateFn()) {
      // Validation failed, don't proceed
      return;
    }

    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Handle form submission
      const submitPromise = fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          interests,
          otherInterest,
          developmentSelections,
          experience,
          contribution,
        }),
      }).then(async (res) => {
        const data = await res.json();
        console.log('📋 API Response:', { status: res.status, data });

        if (!res.ok) {
          console.error('❌ API Error:', data);
          throw new Error(data.details || data.error || 'Submission failed');
        }

        console.log('✅ Submission successful:', data);
        window.localStorage.setItem(submittedKey, 'true');
        window.localStorage.removeItem(storageKey);
        router.replace('/submitted');
        return data;
      }).catch((error) => {
        console.error('❌ Fetch error:', error);
        throw error;
      });

      toast.promise(submitPromise, {
        loading: 'Submitting application...',
        success: 'Application submitted successfully! Redirecting...',
        error: (err) => `Error: ${err.message}`,
      });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <SplitLayout>
      <div className="flex flex-col h-full min-h-[calc(100vh-8rem)]">
        {/* Top Step Indicator */}
        <StepIndicator currentStep={currentStep} />

        {/* Current Step Content */}
        <div className="flex-1">
          {currentStep === 1 && <Step1About formData={formData} setFormData={setFormData} />}
          {currentStep === 2 && (
            <Step2Interests
              interests={interests}
              setInterests={setInterests}
              otherInterest={otherInterest}
              setOtherInterest={setOtherInterest}
              developmentSelections={developmentSelections}
              setDevelopmentSelections={setDevelopmentSelections}
            />
          )}
          {currentStep === 3 && <Step3Experience experience={experience} setExperience={setExperience} />}
          {currentStep === 4 && <Step4Contribution contribution={contribution} setContribution={setContribution} />}
        </div>

        {/* Bottom Navigation Buttons */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-border">
          {currentStep > 1 ? (
            <Button
              variant="ghost"
              onClick={handleBack}
              icon={<ArrowLeft size={18} />}
              iconPosition="left"
            >
              Back
            </Button>
          ) : (
            <div></div> // Empty div for spacing if no back button
          )}

          <Button
            variant="primary"
            onClick={handleNext}
            icon={currentStep < totalSteps ? <ArrowRight size={18} /> : undefined}
          >
            {currentStep === totalSteps ? 'Submit Application' : 'Continue'}
          </Button>
        </div>
      </div>
    </SplitLayout>
  );
}
