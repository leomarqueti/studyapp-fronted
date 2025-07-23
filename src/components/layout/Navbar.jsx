@@ .. @@
 import React from 'react';
 import { Button } from '@/components/ui/button';
 import { useAuth } from '../../contexts/AuthContext';
-import { BookOpen, LogOut, User, BarChart3 } from 'lucide-react';
+import { BookOpen, LogOut, User, BarChart3, Settings } from 'lucide-react';

 const Navbar = ({ currentPage, onNavigate }) => {
@@ .. @@
   const navItems = [
     { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
     { id: 'study', label: 'Estudar', icon: BookOpen },
     { id: 'cards', label: 'Meus Cards', icon: User },
+    { id: 'settings', label: 'Configurações', icon: Settings },
   ];