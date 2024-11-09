(function() {
    let participants = [];
    let emojiGroups = [];

    async function loadParticipants() {
        try {
            console.log('Starte Laden der Teilnehmer...');
            
            const response = await fetch('/data/list.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const csvText = await response.text();
            console.log('CSV geladen:', csvText.substring(0, 100) + '...');
            
            const rows = csvText.split('\n').slice(1); // Header überspringen
            console.log(`${rows.length} Teilnehmer gefunden`);
            
            rows.forEach((row, index) => {
                if (!row.trim()) return;
                
                let [id, name, company, position] = row.split(',');
                
                if (row.match(/"[^"]+"/)) {
                    const matches = row.match(/([^,]+),([^,]+),([^,]+),"(.+)"/);
                    if (matches) {
                        [, id, name, company, position] = matches;
                    }
                }

                id = id.trim();
                name = name.trim();
                company = company.trim();
                position = position.trim().replace(/^"(.*)"$/, '$1');

                console.log(`Verarbeite Teilnehmer: ${id}, ${name}`);

                participants.push({ id, name, company, position });
            });

            displayParticipants(); // Teilnehmer anzeigen
        } catch (error) {
            console.error('Fehler beim Laden der Teilnehmerdaten:', error);
            const container = document.querySelector('.row');
            container.innerHTML = `
                <div class="col-12 text-center">
                    <div class="alert alert-danger" role="alert">
                        Fehler beim Laden der Teilnehmerdaten. Bitte versuchen Sie es später erneut.
                    </div>
                </div>
            `;
        }
    }

    async function loadEmojiGroups() {
        try {
            const response = await fetch('/data/groups.csv');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const csvText = await response.text();
            const rows = csvText.split('\n').slice(1); // Header überspringen

            emojiGroups = rows.map(row => {
                const [emoji, name, color] = row.split(',');
                return { emoji, name, color };
            }).filter(group => group.emoji && group.name && group.color);

            console.log('Emoji-Gruppen geladen:', emojiGroups);

            if (emojiGroups.length === 0) {
                console.error('Keine gültigen Emoji-Gruppen gefunden.');
            }
        } catch (error) {
            console.error('Fehler beim Laden der Emoji-Gruppen:', error);
        }
    }

    function displayParticipants() {
        const participantsContainer = document.getElementById('participantsContainer');
        participantsContainer.innerHTML = participants.map(p => `
            <div class="col-4 col-md-4 col-lg-2">
                <div class="card mb-3">
                    <img src="/images/${p.id}.jpg" alt="${p.name}" class="card-img-top" style="height: 100px; object-fit: cover;">
                    <div class="card-body">
                        <h6 class="card-title">${p.name}</h6>
                        <p class="card-text"><small class="text-muted">${p.company}</small></p>
                    </div>
                </div>
            </div>
        `).join('');
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    function createGroups() {
        const groupCount = parseInt(document.getElementById('groupCount').value);
        shuffleArray(participants);

        const groupsContainer = document.getElementById('groupsContainer');
        groupsContainer.innerHTML = '';

        const groups = Array.from({ length: groupCount }, () => []);

        participants.forEach((participant, index) => {
            groups[index % groupCount].push(participant);
        });

        shuffleArray(emojiGroups); // Shuffle emoji groups for randomness

        groups.forEach((group, index) => {
            const { emoji, name, color } = emojiGroups[index % emojiGroups.length];
            const groupDiv = document.createElement('div');
            groupDiv.className = 'col-12 col-md-6 col-lg-4 group-card';
            groupDiv.style.borderColor = color; // Nur die Farbe im JS setzen
            groupDiv.style.backgroundColor = `${color}33`; // Hintergrundfarbe mit 90% Transparenz
            groupDiv.innerHTML = `<h3 style="color: ${color};">${emoji} Gruppe ${name}</h3><ul class="list-group">` +
                group.map(p => `
                    <li class="list-group-item d-flex align-items-center">
                        <img src="/images/${p.id}.jpg" alt="${p.name}" class="me-3" style="max-width: 99px; height: auto;">
                        <div>
                            <div>${p.name}</div>
                            <small class="text-muted">${p.company}</small>
                        </div>
                    </li>
                `).join('') +
                '</ul>';
            groupsContainer.appendChild(groupDiv);
        });

        // Teilnehmerliste ausblenden
        document.getElementById('participantsContainer').style.display = 'none';
    }

    document.addEventListener('DOMContentLoaded', async () => {
        await loadEmojiGroups(); // Sicherstellen, dass die Gruppen geladen sind
        await loadParticipants(); // Sicherstellen, dass die Teilnehmer geladen sind
        document.getElementById('raffleButton').addEventListener('click', createGroups);
    });
})();