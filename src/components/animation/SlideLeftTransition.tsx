import { motion } from 'framer-motion';

type Props = {
  motionKey: string;
  children: React.ReactNode;
};
export function SlideLeftTransition({ motionKey, children }: Props) {
  return (
    <motion.div
      className="flex min-h-screen grow flex-col bg-white"
      initial={{ opacity: 0, x: 30 }}
      animate={{
        opacity: 1,
        x: 0,
        transition: { duration: 0.2, type: 'tween' },
      }}
      exit={{ opacity: 0, transition: { duration: 0.1, type: 'tween' } }}
      key={motionKey}
    >
      {children}
    </motion.div>
  );
}
