import React from 'react';
import { useLocalization } from '../../../hooks/useLocalization';
import {
  Lightbulb,
  Presentation,
  Codepen,
  Palette,
  Landmark,
  Calculator,
  Megaphone,
  Users,
  Handshake,
  Calendar,
  Briefcase
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '../../../hooks/useToast';

interface Service {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: React.ElementType;
}

interface ServiceCategory {
  id: string;
  titleKey: string;
  services: Service[];
}

const serviceData: ServiceCategory[] = [
  {
    id: 'strategy',
    titleKey: 'incubation.services.strategy.title',
    services: [
      { id: 's1', titleKey: 'incubation.services.strategy.s1_title', descriptionKey: 'incubation.services.strategy.s1_desc', icon: Lightbulb },
      { id: 's2', titleKey: 'incubation.services.strategy.s2_title', descriptionKey: 'incubation.services.strategy.s2_desc', icon: Presentation },
    ]
  },
  {
    id: 'tech',
    titleKey: 'incubation.services.tech.title',
    services: [
      { id: 's3', titleKey: 'incubation.services.tech.s3_title', descriptionKey: 'incubation.services.tech.s3_desc', icon: Codepen },
      { id: 's4', titleKey: 'incubation.services.tech.s4_title', descriptionKey: 'incubation.services.tech.s4_desc', icon: Palette },
    ]
  },
  {
    id: 'legal',
    titleKey: 'incubation.services.legal.title',
    services: [
      { id: 's5', titleKey: 'incubation.services.legal.s5_title', descriptionKey: 'incubation.services.legal.s5_desc', icon: Landmark },
      { id: 's6', titleKey: 'incubation.services.legal.s6_title', descriptionKey: 'incubation.services.legal.s6_desc', icon: Calculator },
    ]
  },
  {
    id: 'marketing',
    titleKey: 'incubation.services.marketing.title',
    services: [
      { id: 's7', titleKey: 'incubation.services.marketing.s7_title', descriptionKey: 'incubation.services.marketing.s7_desc', icon: Megaphone },
      { id: 's8', titleKey: 'incubation.services.marketing.s8_title', descriptionKey: 'incubation.services.marketing.s8_desc', icon: Users },
    ]
  },
];

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
  const { t } = useLocalization();
  const toast = useToast();
  const Icon = service.icon;

  const handleRequest = () => {
    toast.showInfo(`Service request for "${t(service.titleKey)}" has been submitted.`, {title: 'Request Sent'});
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-card dark:bg-dark-card p-6 rounded-xl shadow-soft border dark:border-slate-700/50 flex flex-col"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary-light dark:bg-primary/20 rounded-lg">
          <Icon className="w-6 h-6 text-primary dark:text-secondary" />
        </div>
        <h4 className="font-bold text-lg text-foreground dark:text-dark-foreground">{t(service.titleKey)}</h4>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-3 flex-grow">{t(service.descriptionKey)}</p>
      <button
        onClick={handleRequest}
        className="mt-4 w-full px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-dark transition-colors"
      >
        {t('incubation.services.requestService', 'Request Service')}
      </button>
    </motion.div>
  );
};


const IncubationServicesPage: React.FC = () => {
  const { t, dir } = useLocalization();
  const title = t('sidebar.incubation_services', 'Incubation Services');

  return (
    <div className="space-y-8 animate-fade-in" dir={dir}>
        <div className="flex items-center gap-4">
            <div className="p-3 bg-primary-light dark:bg-primary/20 rounded-xl">
                 <Briefcase className="w-8 h-8 text-primary dark:text-secondary" />
            </div>
            <div>
                <h1 className="text-3xl font-bold text-foreground dark:text-dark-foreground">{title}</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">{t('incubation.services.subtitle', 'Explore the services we offer to help your startup grow.')}</p>
            </div>
        </div>
        
        {serviceData.map((category) => (
            <section key={category.id}>
                <h2 className="text-2xl font-bold mb-4 text-foreground dark:text-dark-foreground">{t(category.titleKey)}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {category.services.map(service => (
                        <ServiceCard key={service.id} service={service} />
                    ))}
                </div>
            </section>
        ))}
    </div>
  );
};

export default IncubationServicesPage;
