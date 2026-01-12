import React from 'react';

function WorkflowSteps({ currentStep, completedSteps, onStepClick }) {
    const steps = [
        { id: 1, label: '캐릭터 생성' },
        { id: 2, label: '배경 생성' },
        { id: 3, label: '말풍선 & 자막' },
        { id: 4, label: '이미지 편집' }
    ];

    return (
        <div className="workflow-steps">
            {steps.map(step => (
                <div
                    key={step.id}
                    className={`step ${currentStep === step.id ? 'active' : ''} ${completedSteps.includes(step.id) ? 'completed' : ''}`}
                    onClick={() => onStepClick(step.id)}
                >
                    <div className="step-number">{step.id}</div>
                    <div className="step-label">{step.label}</div>
                </div>
            ))}
        </div>
    );
}

export default WorkflowSteps;
