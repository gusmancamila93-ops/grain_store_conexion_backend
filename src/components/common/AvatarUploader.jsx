function AvatarUploader({ src, fallback = "GS", label = "Avatar de usuario" }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid size-12 place-items-center overflow-hidden rounded-full bg-secondary text-sm font-bold text-secondary-foreground">
        {src ? <img alt={label} className="size-full object-cover" src={src} /> : fallback}
      </div>
      <span className="text-sm font-semibold text-foreground">{label}</span>
    </div>
  );
}

export default AvatarUploader;
