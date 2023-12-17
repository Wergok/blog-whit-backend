window.addEventListener("DOMContentLoaded", async () => {
   const postsList = document.querySelector(".posts");

   const res = await fetch("http://127.0.0.1:3000/posts");
   if (res.ok) {
      const posts = await res.json()
      for (const post of Object.values(posts)) {
         const template = `<li class="posts__post">
<p class="posts__text">${post.text}</p>
</li>`;
         postsList.insertAdjacentHTML("beforeend", template);
      }
   }
});
