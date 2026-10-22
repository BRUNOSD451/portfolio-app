import { useState } from "react";
import {
  Screen,
  Card,
  Field,
  Button,
  Notice,
} from "../../../resources/components/ui/ui";
import { useAction } from "../../../resources/hooks/useAction";
import { useSession } from "../../../resources/hooks/useSession";
import { signIn } from "../../../resources/services/session";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const action = useAction();
  const { error } = useSession();
  const submit = () =>
    void action.run(async () => {
      if (!email.trim() || !password)
        throw new Error("Informe seu e-mail e sua senha.");
      await signIn(email, password);
      setPassword("");
    });
  return (
    <Screen
      title="Seu espaço de criação."
      subtitle="Entre para cuidar dos seus projetos e da sua história."
    >
      <Card>
        <Field
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          maxLength={150}
          editable={!action.busy}
        />
        <Field
          label="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          maxLength={128}
          editable={!action.busy}
          onSubmitEditing={submit}
        />
        <Notice text={action.error || error} error />
        <Button
          label={action.busy ? "Entrando…" : "Entrar"}
          onPress={submit}
          disabled={action.busy}
        />
      </Card>
    </Screen>
  );
}
