"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ClientBackComponent = ({ message }) => {
  const router = useRouter();

  useEffect(() => {
    alert(message);
    router.back();
  }, [message, router]);

  return null;
};

export default ClientBackComponent;
