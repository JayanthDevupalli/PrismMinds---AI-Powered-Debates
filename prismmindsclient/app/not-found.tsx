export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-4xl font-bold mb-4">404 – Article Not Found</h1>
      <p className="text-muted-foreground mb-6">
        Sorry, we couldn’t find the blog post you were looking for.
      </p>
      <a
        href="/blogs"
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Back to Articles
      </a>
    </div>
  )
}
