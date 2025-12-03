document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.authorLink');

    links.forEach(link => {
        link.addEventListener('click', event => {
        event.preventDefault();
        const id = link.id;
        getAuthorInfo(id);
        });
    });
});

async function getAuthorInfo(authorId) {
    try {
        //launch modal
        var myModal = new bootstrap.Modal(document.getElementById('authorModal'));
        myModal.show();

        //get author info using api
        const response = await fetch(`/api/author/${authorId}`);
        const data = await response.json();

        if (!data || data.length === 0) {
        document.getElementById('authorInfo').innerHTML =
            '<p>No author info found.</p>';
        return;
        }

        const author = data[0];

        const fullName   = `${author.firstName} ${author.lastName}`;
        const dob        = author.dob;
        const dod        = author.dod || 'N/A';
        const profession = author.profession;
        const country    = author.country;
        const bio        = author.biography;
        const portrait   = author.portrait;

        //populate modal with author info
        document.getElementById('authorInfo').innerHTML = `
        <div class="text-center">
            <img src="${portrait}" alt="${fullName}" class="img-fluid mb-3">
        </div>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Born:</strong> ${dob}</p>
        <p><strong>Died:</strong> ${dod}</p>
        <p><strong>Profession:</strong> ${profession}</p>
        <p><strong>Country:</strong> ${country}</p>
        <p><strong>Biography:</strong> ${bio}</p>
        `;
    } catch (err) {
        console.error(err);
        document.getElementById('authorInfo').innerHTML =
        '<p>Error loading author info.</p>';
    }
}