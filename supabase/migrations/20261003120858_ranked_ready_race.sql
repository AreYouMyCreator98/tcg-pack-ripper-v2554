-- A ranked match has immutable pack terms. One player's readiness must not
-- invalidate the other player's confirmation of those same terms.
-- Trade and private-room revisions still require explicit review after changes.
do $migration$
declare definition text; patched text;
begin
 definition:=pg_get_functiondef('hub_private.command(text,jsonb,uuid)'::regprocedure);
 patched:=replace(definition,'host_ready=ready,revision=revision+1','host_ready=ready,revision=revision+case when r.ranked then 0 else 1 end');
 patched:=replace(patched,'guest_ready=ready,revision=revision+1','guest_ready=ready,revision=revision+case when r.ranked then 0 else 1 end');
 if patched=definition then raise exception 'Ranked readiness patch did not match expected command'; end if;
 execute patched;
end $migration$;
