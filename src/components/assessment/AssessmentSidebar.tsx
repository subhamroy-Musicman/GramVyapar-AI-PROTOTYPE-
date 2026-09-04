import { CheckCircle2, Lock } from "lucide-react";

interface AssessmentSidebarProps {
  currentStep: number;
}

export function AssessmentSidebar({ currentStep }: AssessmentSidebarProps) {
  const steps = [
    {
      num: 1,
      title: "Entrepreneur Profile",
      desc: "Your context and starting point"
    },
    {
      num: 2,
      title: "Dairy Plan",
      desc: "Your proposed dairy unit"
    },
    {
      num: 3,
      title: "Financial & Risk Analysis",
      desc: "Economics, borrowing and resilience"
    },
    {
      num: 4,
      title: "Assessment Brief",
      desc: "Decision and next steps"
    }
  ];

  return (
    <div className="hidden md:flex flex-col w-[260px] shrink-0 bg-[#1F4A45] text-white h-[calc(100vh-72px)] fixed left-0 top-[72px] border-r border-[#123524] z-10 overflow-hidden">
      {/* Scenery Layer */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-[60%] pointer-events-none select-none z-0"
        style={{
          backgroundImage: "url('/sidebar-rural-scene.png')",
          backgroundPosition: "bottom center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% auto"
        }}
      >
        {/* Subtle transition fade from the dark teal background into the scenery */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1F4A45] via-[#1F4A45]/40 to-transparent"></div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col h-full p-6 overflow-y-auto">
        <div className="mb-8 shrink-0">
          <p className="text-[10px] font-bold tracking-widest text-[#DDE8E1]/70 uppercase mb-2">Your Path</p>
          <h2 className="text-2xl font-serif leading-tight">Four careful steps</h2>
        </div>

        <div className="mb-6 shrink-0">
          <p className="text-xs font-medium text-[#DDE8E1]">Step {currentStep} of 4</p>
        </div>

        <div className="flex-1 flex flex-col gap-6 relative shrink-0">
          <div className="absolute left-[11px] top-4 bottom-8 w-px bg-white/10 z-0"></div>
          {steps.map((step) => {
            const isCompleted = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            const isFuture = currentStep < step.num;

            return (
              <div key={step.num} className={`relative z-10 flex gap-4 ${isFuture ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
                <div className={`shrink-0 w-[24px] h-[24px] rounded-full flex items-center justify-center text-xs font-bold border-2 
                  ${isCompleted ? 'bg-brand-50 border-brand-50 text-brand-900' : 
                    isCurrent ? 'bg-transparent border-white text-white' : 
                    'bg-transparent border-white/30 text-white/50'}`}>
                  {isCompleted ? <CheckCircle2 className="w-4 h-4 text-[#1F4A45]" /> : (isFuture ? <Lock className="w-3 h-3" /> : step.num)}
                </div>
                <div className="pt-0.5">
                  <h3 className={`text-sm font-semibold ${isCurrent ? 'text-white' : 'text-[#DDE8E1]'}`}>{step.title}</h3>
                  <p className={`text-xs mt-1 leading-relaxed ${isCurrent ? 'text-white/80' : 'text-[#DDE8E1]/60'}`}>{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
