
  import { createRoot } from "react-dom/client";
  import App from "./app/App";
  import { AuthProvider } from "./app/state/authStore";
  import { HabitProvider } from "./app/state/habitStore";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <HabitProvider>
        <App />
      </HabitProvider>
    </AuthProvider>
  );
  
