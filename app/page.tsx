"use client";

import Container from "@/app/components/atoms/container";
import LoginContainer from "@/app/components/organisms/LoginContainer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Container>
        <LoginContainer />
      </Container>
    </div>
  );
}
