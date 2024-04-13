import { motion } from 'framer-motion';

type Props = {
  motionKey: string;
  children: React.ReactNode;
};
export function SlideUpTransition({ motionKey, children }: Props) {
  return (
    <motion.div
      className="flex min-h-screen grow flex-col bg-background"
      initial={{ opacity: 0, y: 30 }}
      animate={{
        opacity: 1,
        y: 0,
        transition: { duration: 0.2, type: 'tween' },
      }}
      exit={{ opacity: 0, transition: { duration: 0.1, type: 'tween' } }}
      key={motionKey}
    >
      {children}
    </motion.div>
  );
}
