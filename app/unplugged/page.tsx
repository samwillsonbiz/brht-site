import { redirect } from "next/navigation";

export default function UnpluggedRedirect() {
  redirect("/outside-the-feed");
}
