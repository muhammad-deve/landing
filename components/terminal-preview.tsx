export function TerminalPreview() {
  return (
    <div className="w-full max-w-2xl overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27ca40]" />
        </div>
        <span className="ml-2 font-mono text-xs text-muted-foreground">terminal</span>
      </div>
      <div className="p-4 font-mono text-sm leading-relaxed text-left">
        {/* Command */}
        <div className="flex">
          <span className="text-muted-foreground">$</span>
          <span className="ml-2 text-foreground">goport http 8080</span>
        </div>

        {/* Session Info */}
        <div className="mt-4 space-y-0.5">
          <div className="flex">
            <span className="w-32 text-muted-foreground">Dashboard</span>
            <span className="text-foreground">http://127.0.0.1:4040</span>
          </div>
          <div className="flex">
            <span className="w-32 text-muted-foreground">Region</span>
            <span className="text-foreground">Europe (eu)</span>
          </div>
          <div className="flex">
            <span className="w-32 text-muted-foreground">Status</span>
            <span>
              <span className="text-primary">online</span>
              <span className="text-muted-foreground"> (140ms)</span>
            </span>
          </div>
          <div className="flex">
            <span className="w-32 text-muted-foreground">Forwarding</span>
            <span>
              <span className="text-primary">https://abc123.goport.uz</span>
              <span className="text-muted-foreground"> → </span>
              <span className="text-foreground">localhost:8080</span>
            </span>
          </div>
        </div>

        {/* HTTP Requests Section */}
        <div className="mt-6">
          <div className="text-foreground">HTTP Requests</div>
          <div className="text-muted-foreground">-------------</div>
          <div className="mt-2 space-y-0.5 text-xs">
            <div>
              <span className="text-muted-foreground">14:32:15</span>
              <span className="ml-2 text-blue-400">GET</span>
              <span className="ml-3 text-foreground">/api/users</span>
              <span className="ml-4 text-primary">202 OK</span>
            </div>
            <div>
              <span className="text-muted-foreground">14:32:08</span>
              <span className="ml-2 text-green-400">POST</span>
              <span className="ml-2 text-foreground">/api/auth/login</span>
              <span className="ml-4 text-primary">202 OK</span>
            </div>
            <div>
              <span className="text-muted-foreground">14:31:52</span>
              <span className="ml-2 text-orange-400">PUT</span>
              <span className="ml-3 text-foreground">/api/users/42</span>
              <span className="ml-4 text-primary">202 OK</span>
            </div>
            <div>
              <span className="text-muted-foreground">14:31:45</span>
              <span className="ml-2 text-red-400">DELETE</span>
              <span className="ml-2 text-foreground">/api/posts/17</span>
              <span className="ml-4 text-primary">202 OK</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
