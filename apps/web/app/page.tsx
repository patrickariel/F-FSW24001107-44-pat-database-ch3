import { LoginDialog } from "@/components/login";
import { Button } from "@repo/ui/button";

export default function Page() {
  return (
    <div>
      <LoginDialog trigger={<Button>Login</Button>} />
    </div>
  );
}
