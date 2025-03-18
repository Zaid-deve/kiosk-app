"use client";

import { API_URL } from '@/lib/base';
import { createContext, useState, useContext, useEffect } from 'react';

// Create context
const MenuContext = createContext();

// Custom hook to use the context
export const useMenu = () => {
  const context = useContext(MenuContext);
  return context;
};

// MenuProvider component to wrap around your app
export const MenuProvider = ({ children }: any) => {
  const [menuItems, setMenuItems] = useState([]);

  // fetch all the menu items
  useEffect(() => {
    // get all the items
    (async () => {
      try {
        const req = await fetch(API_URL + '/menu/fetch.php', {
          method: "POST",
          headers: { 'content-type': 'application/json' }
        })
        const result = await req.json();
        if (req.ok) {
          setMenuItems(result.data || []);
        }
        else {
          alert(result.error);
        }
      } catch (error: any) {
        alert(error.message);
      }
    })()
  }, []);

  return (
    <MenuContext.Provider value={{ menuItems, setMenuItems }}>
      {children}
    </MenuContext.Provider>
  );
};
