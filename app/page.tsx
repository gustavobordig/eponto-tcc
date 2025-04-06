
// Atoms
import Container from "@/app/components/atoms/container";

// Organisms
import LoginContainer from "@/app/components/organisms/LoginContainer";

export default function Home() {
  return (
    <div className="">
      <Container>
        <LoginContainer />
      </Container>
    </div>
  );
}
