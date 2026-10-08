"use client";


// Atoms
import Container from "@/shared/ui/Container";

// Organisms
import LoginContainer from "@/features/auth/components/LoginContainer";

// Utils

export default function Home() {
  return (
    <div className="">
      <Container>
        <LoginContainer />
      </Container>
    </div>
  );
}
