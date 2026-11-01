type ProfilePhotoProps = {
  src: string
  alt: string
}

function ProfilePhoto({ src, alt }: ProfilePhotoProps) {
  return (
    <div className="h-32 w-32 shrink-0 overflow-hidden rounded-full">
      <img
        src={src}
        alt={alt}
        className="translate-y-5 -translate-x-3 h-full w-full scale-[2.5] object-cover object-top"
      />
    </div>
  )
}

export default ProfilePhoto
