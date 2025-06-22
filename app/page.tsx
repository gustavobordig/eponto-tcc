"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { tokenUtils } from "@/utils/token";

// Atoms
import Container from "@/app/components/atoms/container";

// Organisms
import LoginContainer from "@/app/components/organisms/LoginContainer";

// Utils
import { showSuccessToast } from "@/utils/toast";

export default function Home() {
  return (
    <div className="">
      <Container>
        <LoginContainer />
      </Container>
    </div>
  );
}
