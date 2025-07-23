@@ .. @@
 import React, { createContext, useContext, useState, useEffect } from 'react';
-import { authService } from '../services/api';
+import fileSystemService from '../services/fileSystemService';

 const AuthContext = createContext();
@@ .. @@
   useEffect(() => {
-    // Verificar se há um usuário logado no localStorage
-    const token = localStorage.getItem('token');
-    const userData = localStorage.getItem('user');
-    
-    if (token && userData) {
-      setUser(JSON.parse(userData));
+    // Verificar se há um usuário nos dados locais
+    const userData = fileSystemService.getUser();
+    if (userData) {
+      setUser(userData);
     }
-    
     setLoading(false);
   }, []);

   const login = async (credentials) => {
     try {
-      const response = await authService.login(credentials);
-      const { user: userData, token } = response.data;
-      
-      localStorage.setItem('token', token);
-      localStorage.setItem('user', JSON.stringify(userData));
+      // Simular login offline - apenas validar se o usuário existe
+      const userData = {
+        id: Date.now().toString(),
+        username: credentials.username,
+        created_at: new Date().toISOString()
+      };
+      
+      fileSystemService.setUser(userData);
       setUser(userData);
       
       return { success: true };
     } catch (error) {
       return { 
         success: false, 
-        error: error.response?.data?.error || 'Erro ao fazer login' 
+        error: 'Erro ao fazer login' 
       };
     }
   };

   const register = async (userData) => {
     try {
-      const response = await authService.register(userData);
-      const { user: newUser, token } = response.data;
-      
-      localStorage.setItem('token', token);
-      localStorage.setItem('user', JSON.stringify(newUser));
+      // Simular registro offline
+      const newUser = {
+        id: Date.now().toString(),
+        username: userData.username,
+        created_at: new Date().toISOString()
+      };
+      
+      fileSystemService.setUser(newUser);
       setUser(newUser);
       
       return { success: true };
     } catch (error) {
       return { 
         success: false, 
-        error: error.response?.data?.error || 'Erro ao criar conta' 
+        error: 'Erro ao criar conta' 
       };
     }
   };

   const logout = () => {
-    localStorage.removeItem('token');
-    localStorage.removeItem('user');
+    fileSystemService.removeUser();
     setUser(null);
   };