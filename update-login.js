const fs = require('fs');
const file = 'apps/web/app/(auth)/login/page.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace('import { apiClient } from "@/lib/api/client";', 'import { AuthAdapter } from "@/lib/functional/adapters/auth-adapter";\nimport { isMockMode } from "@/lib/functional/config";\nimport { apiClient } from "@/lib/api/client";');

content = content.replace('formState: { errors },', 'setValue, formState: { errors },');

content = content.replace(/const response = await apiClient<AuthApiResponse>[^;]+;/s, 'const response = await AuthAdapter.login(data.identifier, data.password);');

const demoAccountsUI = \
      {isMockMode() && (
        <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground space-y-2">
          <p className="font-bold mb-2">Demo Accounts (Functional Mode)</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Button variant="outline" size="sm" type="button" onClick={() => fillDemoAccount('superadmin')}>Super Admin</Button>
            <Button variant="outline" size="sm" type="button" onClick={() => fillDemoAccount('admin')}>Admin</Button>
            <Button variant="outline" size="sm" type="button" onClick={() => fillDemoAccount('teacher')}>Teacher</Button>
            <Button variant="outline" size="sm" type="button" onClick={() => fillDemoAccount('parent')}>Parent</Button>
          </div>
        </div>
      )}
\;

content = content.replace('      <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground space-y-2">',
\  const fillDemoAccount = (username: string) => {
    setValue("identifier", username);
    setValue("password", "password");
  };

\ + demoAccountsUI + '\n      <div className="mt-6 border-t pt-4 text-center text-xs text-muted-foreground space-y-2">');

fs.writeFileSync(file, content);
