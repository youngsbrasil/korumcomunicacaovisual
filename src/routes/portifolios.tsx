import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/portifolios")({
  component: () => <Outlet />,
});