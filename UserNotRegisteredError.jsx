const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldX, ArrowRight, MailOpen } from 'lucide-react';

const UserNotRegisteredError = () => {
  return (
    <div className="min-h-screen auth-bg flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background orbs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[100px] pointer-events-none" />

      {/* Animated grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(258,90%,60%,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(258,90%,60%,0.03)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative max-w-md w-full"
      >
        {/* Card */}
        <div className="relative bg-card/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl overflow-hidden">
          {/* Gradient top bar */}
          <div className="absolute top-0 left-0 right-0 h-0.5 gradient-primary" />

          {/* Icon */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
            className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-6"
          >
            <ShieldX className="w-8 h-8 text-destructive" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center"
          >
            <h1 className="text-2xl font-bold font-display mb-2">Access Restricted</h1>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              Your account isn't registered for this app yet. Contact the administrator to request access.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <div className="p-4 rounded-xl bg-muted/60 border border-border/50 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <MailOpen className="w-3.5 h-3.5" />
                What you can do
              </div>
              {[
                "Verify you're logged in with the correct account",
                "Contact the app administrator for access",
                "Try logging out and back in again",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02, boxShadow: "0 0 25px hsla(258,90%,60%,0.35)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => db.auth.logout()}
              className="w-full py-3 rounded-xl gradient-primary text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200"
            >
              Sign in with different account
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </motion.div>
        </div>

        {/* Brand below card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <span className="text-sm font-bold font-display gradient-text">SocialGlass</span>
          <span className="text-xs text-muted-foreground ml-2">· AI Social Media Suite</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default UserNotRegisteredError;