import { permanentRedirect } from "next/navigation";

export default function RefundPolicyRedirect() {
  permanentRedirect("/returns-policy");
}
