/*
 * Copyright (c) 2026 ykat UG (haftungsbeschraenkt) - All Rights Reserved
 *
 * Permission for non-commercial use is hereby granted,
 * free of charge, without warranty of any kind.
 */

import type { I18nMessages } from '#i18n/messages';

export const deMessages:I18nMessages = {
	"Automatic (browser)":
		"Automatisch (Browser)",
	"Language":
		"Sprache",
	"English":
		"Englisch",
	"Home":
		"Startseite",
	"Documentation":
		"Dokumentation",
	"Admin":
		"Admin",
	"Administration":
		"Verwaltung",
	"Admin sections":
		"Admin-Bereiche",
	"Authentication":
		"Authentifizierung",
	"Configure this server or manage federated peers.":
		"Konfigurieren Sie diesen Server oder verwalten Sie verbundene "
		+"Peers.",
	"Documentation sections":
		"Dokumentationsbereiche",
	"API":
		"API",
	"PetQuery API reference":
		"PetQuery-API-Referenz",
	"PetQuery documentation":
		"PetQuery-Dokumentation",
	"API clients":
		"API-Clients",
	"Config":
		"Konfiguration",
	"Logs":
		"Protokolle",
	"Request logs":
		"Anfrageprotokolle",
	"Servers":
		"Server",
	"Users":
		"Benutzer",
	"Pets":
		"Tiere",
	"Checking your session...":
		"Sitzung wird überprüft...",
	"Checking...":
		"Wird überprüft...",
	"Initial setup":
		"Ersteinrichtung",
	"Sign out":
		"Abmelden",
	"Public":
		"Öffentlich",
	"Selected authentication provider is unavailable":
		"Der ausgewählte Anmeldeanbieter ist nicht verfügbar.",
	"Selected provider uses redirect sign-in":
		"Der ausgewählte Anbieter verwendet eine Weiterleitung zur "
		+"Anmeldung.",
	"Sign in to PetQuery Admin":
		"Bei PetQuery Admin anmelden",
	"No login providers are enabled.":
		"Es sind keine Anmeldeanbieter aktiviert.",
	"Sign-in provider":
		"Anmeldeanbieter",
	"Continue to {provider}":
		"Weiter zu {provider}",
	"Continue with {provider}.":
		"Mit {provider} fortfahren.",
	"Sign in with your {provider} account.":
		"Mit Ihrem {provider}-Konto anmelden.",
	"Username":
		"Benutzername",
	"Password":
		"Passwort",
	"Signing in...":
		"Anmeldung läuft...",
	"Sign in":
		"Anmelden",
	"First-time setup":
		"Ersteinrichtung",
	"Create the administrator account":
		"Administratorkonto erstellen",
	"Passwords do not match":
		"Die Passwörter stimmen nicht überein.",
	"Initial setup did not create an admin session":
		"Die Ersteinrichtung hat keine Administratorsitzung erstellt.",
	"Confirm password":
		"Passwort bestätigen",
	"Creating admin...":
		"Administrator wird erstellt...",
	"Create admin":
		"Administrator erstellen",
	"setup.firstAdminWarning":
		"Dieser Server hat noch keinen lokalen Administrator. Der erste "
		+"Client, der die Einrichtung abschließt, wird Administrator. "
		+"Fahren Sie nur in einem vertrauenswürdigen Netzwerk fort.",
	"ms":
		"ms",
	"s":
		"s",
	"min":
		"Min.",
	"Plugin options must be a JSON object":
		"Die Plugin-Optionen müssen ein JSON-Objekt sein.",
	"Invalid plugin options JSON":
		"Ungültiges JSON für Plugin-Optionen.",
	"Disabling the admin route turns off this GUI.":
		"Wenn Sie die Admin-Route deaktivieren, wird diese GUI "
		+"abgeschaltet.",
	"config.disableApiWarning":
		"Wenn Sie die API-Route deaktivieren, werden auch /api/config/* "
		+"und /api/server/* deaktiviert. Diese Seite funktioniert nach "
		+"einem Neustart nicht mehr.",
	"Viewing and editing the config requires an admin session.":
		"Zum Anzeigen und Bearbeiten der Konfiguration ist eine "
		+"Adminsitzung erforderlich.",
	"Load":
		"Laden",
	"Discard unsaved changes?":
		"Nicht gespeicherte Änderungen verwerfen?",
	"{warnings}\n\nSave anyway?":
		"{warnings}\n\nTrotzdem speichern?",
	"Saved changes take effect when the server restarts:":
		"Gespeicherte Änderungen werden nach einem Neustart wirksam:",
	"HTTP":
		"HTTP",
	"Port":
		"Port",
	"Trusted proxy IPs/CIDRs":
		"Vertrauenswürdige Proxy-IP-Adressen/CIDRs",
	"config.trustedProxyHelp":
		"Eine vertrauenswürdige Proxy-IP-Adresse oder ein CIDR pro Zeile. "
		+"Nur X-Forwarded-For dieser Proxys vertrauen. Für direkte "
		+"Verbindungen leer lassen.",
	"Enabled providers":
		"Aktivierte Anbieter",
	"config.providerHelp":
		"Geben Sie pro Zeile den Namen eines registrierten Anbieters ein. "
		+"Die Anbieter werden bei der Anmeldung ausdrücklich ausgewählt.",
	"Legacy mode value (compatibility only)":
		"Legacy-Moduswert (nur aus Kompatibilitätsgründen)",
	"Common legacy mode values":
		"Übliche Legacy-Moduswerte",
	"LMDB users":
		"LMDB-Benutzer",
	"LDAP":
		"LDAP",
	"OpenID Connect":
		"OpenID Connect",
	"Secure session cookie":
		"Sicheres Sitzungscookie",
	"Session cookie name":
		"Name des Sitzungscookies",
	"Session lifetime (ms)":
		"Sitzungsdauer (ms)",
	"Users database":
		"Benutzerdatenbank",
	"Sessions database":
		"Sitzungsdatenbank",
	"LDAP URL":
		"LDAP-URL",
	"Bind DN":
		"Bind-DN",
	"Bind password":
		"Bind-Passwort",
	"User base DN":
		"Basis-DN der Benutzer",
	"User filter":
		"Benutzerfilter",
	"Admin group":
		"Admin-Gruppe",
	"Issuer":
		"Aussteller",
	"Client ID":
		"Client-ID",
	"Client secret":
		"Clientschlüssel",
	"Redirect URI":
		"Weiterleitungs-URI",
	"Scopes":
		"Berechtigungsbereiche",
	"Provider options (JSON)":
		"Anbieteroptionen (JSON)",
	"Results":
		"Ergebnisse",
	"Max results per plugin":
		"Maximale Ergebnisse pro Plugin",
	"Max results in total":
		"Maximale Gesamtzahl der Ergebnisse",
	"File upload":
		"Datei-Upload",
	"Enabled":
		"Aktiviert",
	"Max file size (bytes)":
		"Maximale Dateigröße (Bytes)",
	"Peer sync":
		"Peer-Synchronisierung",
	"Interval (ms)":
		"Intervall (ms)",
	"Request timeout (ms)":
		"Zeitlimit für Anfragen (ms)",
	"Max servers read per peer":
		"Maximale gelesene Server pro Peer",
	"Routes":
		"Routen",
	"/api (includes this page's API)":
		"/api (einschließlich der API dieser Seite)",
	"/ (this GUI)":
		"/ (diese GUI)",
	"Plugins queried by /api":
		"Von /api abgefragte Plugins",
	"Save":
		"Speichern",
	"Reset":
		"Zurücksetzen",
	"Reload":
		"Neu laden",
	"Unsaved: {paths}":
		"Nicht gespeichert: {paths}",
	"No unsaved changes.":
		"Keine ungespeicherten Änderungen.",
	"All listed API calls":
		"Alle aufgeführten API-Aufrufe",
	"API permissions":
		"API-Berechtigungen",
	"Allowed IPs":
		"Zulässige IP-Adressen",
	"Last updated":
		"Zuletzt aktualisiert",
	"Revoke API client \"{name}\"?":
		"API-Client „{name}“ widerrufen?",
	"Copy the new API-client token":
		"Neues API-Client-Token kopieren",
	"apiClients.oneTimeToken":
		"Dieses Token wird nur einmal angezeigt. Bewahren Sie es sicher "
		+"auf; der Server speichert nur den Hash.",
	"Dismiss":
		"Schließen",
	"apiClients.description":
		"Verwalten Sie Bearer-Zugangsdaten für API- und "
		+"Server-zu-Server-Anfragen. Diese Clients können sich nicht an "
		+"der Admin-GUI anmelden.",
	"Refresh":
		"Aktualisieren",
	"No API clients have been created.":
		"Es wurden noch keine API-Clients erstellt.",
	"Edit":
		"Bearbeiten",
	"Revoke":
		"Widerrufen",
	"Create API client":
		"API-Client erstellen",
	"Edit API client":
		"API-Client bearbeiten",
	"Rotate token":
		"Token rotieren",
	"Rotate API-client token for \"{name}\"? This revokes the current token.":
		"Token für den API-Client „{name}“ rotieren? Dadurch wird das "
		+"aktuelle Token widerrufen.",
	"Name":
		"Name",
	"Allowed source IPs":
		"Zulässige Quell-IP-Adressen",
	"apiClients.allowedSourceIpsHelp":
		"Geben Sie pro Zeile eine genaue IPv4- oder IPv6-Adresse ein. "
		+"Verwenden Sie *, um beliebige Quell-IP-Adressen zu erlauben. "
		+"Konfigurieren Sie für Proxy-Anfragen Proxy-IP-Adressen/CIDRs "
		+"unter Konfiguration > HTTP; nur deren X-Forwarded-For-Werte "
		+"werden vertraut.",
	"Allowed API calls":
		"Zulässige API-Aufrufe",
	"apiClients.scopesHelp":
		"Berechtigungsbereiche gelten bei Verwendung dieses "
		+"Bearer-Tokens. Bestehende öffentliche API-Routen bleiben ohne "
		+"Token verfügbar.",
	"All listed /api calls":
		"Alle aufgeführten /api-Aufrufe",
	"apiClients.adminSessionHelp":
		"Routen zur Verwaltung von API-Clients und Benutzern erfordern "
		+"immer eine Adminsitzung.",
	"Create client":
		"Client erstellen",
	"Save client":
		"Client speichern",
	"Cancel":
		"Abbrechen",
	"Read server status":
		"Serverstatus lesen",
	"List known servers":
		"Bekannte Server auflisten",
	"Add or update a server":
		"Server hinzufügen oder aktualisieren",
	"Remove a server":
		"Server entfernen",
	"Read application logs":
		"Anwendungsprotokolle lesen",
	"Read request logs":
		"Anfrageprotokolle lesen",
	"Read server configuration":
		"Serverkonfiguration lesen",
	"Update server configuration":
		"Serverkonfiguration aktualisieren",
	"Search pets":
		"Tiere suchen",
	"Report a pet sighting":
		"Tiersichtung melden",
	"List pets":
		"Tiere auflisten",
	"Create a pet":
		"Tier erstellen",
	"Read a pet":
		"Tier lesen",
	"Update a pet":
		"Tier aktualisieren",
	"Delete a pet":
		"Tier löschen",
	"Filter {label}":
		"{label} filtern",
	"Sort by":
		"Sortieren nach",
	"Sort ascending":
		"Aufsteigend sortieren",
	"Sort descending":
		"Absteigend sortieren",
	"Ascending":
		"Aufsteigend",
	"Descending":
		"Absteigend",
	"No {label} match the filter.":
		"Keine passenden Einträge für {label} gefunden.",
	"Actions":
		"Aktionen",
	"{label} results":
		"Ergebnisse: {label}",
	"Attached file {number}":
		"Anhang {number}",
	"Attached file {number}: invalid attachment URL.":
		"Anhang {number}: ungültige URL.",
	"Attached file {number}: unsupported attachment URL.":
		"Anhang {number}: nicht unterstützte URL.",
	"Open {label}":
		"{label} öffnen",
	"Preview of {label}":
		"Vorschau: {label}",
	"Your browser does not support video previews.":
		"Ihr Browser unterstützt keine Videovorschau.",
	"Preview unavailable. Use the attachment link to open it.":
		"Vorschau nicht verfügbar. Öffnen Sie den Anhang über den Link.",
	"Delete user {username}?":
		"Benutzer {username} löschen?",
	"Manage local users and review external identities.":
		"Lokale Benutzer verwalten und externe Identitäten prüfen.",
	"User management provider":
		"Anbieter für die Benutzerverwaltung",
	"No users found.":
		"Keine Benutzer gefunden.",
	"Delete":
		"Löschen",
	"Add user":
		"Benutzer hinzufügen",
	"Edit user":
		"Benutzer bearbeiten",
	"Display name":
		"Anzeigename",
	"Group":
		"Gruppe",
	"User":
		"Benutzer",
	"Create user":
		"Benutzer erstellen",
	"Save user":
		"Benutzer speichern",
	"No enabled provider supports user management.":
		"Kein aktivierter Anbieter unterstützt die Benutzerverwaltung.",
	"Never":
		"Nie",
	"Not pinged":
		"Nicht angepingt",
	"GID":
		"GID",
	"URI":
		"URI",
	"Admin contact":
		"Admin-Kontakt",
	"Company address":
		"Firmenadresse",
	"Ping latency (ms)":
		"Ping-Latenz (ms)",
	"Added time":
		"Hinzugefügt am",
	"Updated time":
		"Aktualisiert am",
	"Last ping time":
		"Letzter Ping",
	"Delete server {gid}?":
		"Server {gid} löschen?",
	"This server:":
		"Dieser Server:",
	"servers.peerSharingHelp":
		"Die Ping-Latenz wird von diesem Server aus gemessen. Kontakt- "
		+"und Adressdaten werden mit verbundenen Peers geteilt.",
	"No servers known.":
		"Keine Server bekannt.",
	"Add or replace server":
		"Server hinzufügen oder ersetzen",
	"Pet GID":
		"Tier-GID",
	"Species":
		"Tierart",
	"Owner contact":
		"Kontakt der Halterin/des Halters",
	"No pets found.":
		"Keine Tiere gefunden.",
	"Delete pet {gid}?":
		"Tier {gid} löschen?",
	"Manage the local pet JSON database.":
		"Die lokale JSON-Datenbank für Tiere verwalten.",
	"Add pet":
		"Tier hinzufügen",
	"Edit pet":
		"Tier bearbeiten",
	"Notes":
		"Notizen",
	"Upload preview image":
		"Vorschaubild hochladen",
	"Choose a PNG, JPEG, GIF, WebP, AVIF, or BMP image.":
		"Wählen Sie ein PNG-, JPEG-, GIF-, WebP-, AVIF- oder BMP-Bild "
		+"aus.",
	"Could not read image \"{name}\"":
		"Bild „{name}“ konnte nicht gelesen werden.",
	"Saved image {number}":
		"Gespeichertes Bild {number}",
	"Saved preview image":
		"Gespeichertes Vorschaubild",
	"Pet preview":
		"Tier-Vorschau",
	"Remove preview image":
		"Vorschaubild entfernen",
	"Source {field}":
		"Quelle {field}",
	"Attributes":
		"Attribute",
	"Attribute {number} key":
		"Attribut {number}: Schlüssel",
	"Attribute {number} value":
		"Attribut {number}: Wert",
	"Remove":
		"Entfernen",
	"Add attribute":
		"Attribut hinzufügen",
	"Upload attachment images":
		"Anhangsbilder hochladen",
	"Remove image":
		"Bild entfernen",
	"Create pet":
		"Tier erstellen",
	"Save pet":
		"Tier speichern",
	"Enter a microchip ID or select files.":
		"Geben Sie eine Mikrochip-ID ein oder wählen Sie Dateien aus.",
	"Federated pet lookup":
		"Verbundweite Tiersuche",
	"Find a pet. Bring them home.":
		"Finden Sie ein Tier. Bringen Sie es nach Hause.",
	"Search enabled registries with a microchip ID, files, or both.":
		"Durchsuchen Sie aktivierte Register mit einer Mikrochip-ID, "
		+"Dateien oder beidem.",
	"One search across trusted sources":
		"Eine Suche über vertrauenswürdige Quellen",
	"Microchip ID":
		"Mikrochip-ID",
	"Files":
		"Dateien",
	"Searching...":
		"Suche läuft...",
	"Search for a pet":
		"Nach einem Tier suchen",
	"One tiny chip. A whole lot of hope.":
		"Ein winziger Chip. Eine große Hoffnung.",
	"Why PetQuery?":
		"Warum PetQuery?",
	"search.missingPetIntro":
		"Wenn ein Tier vermisst wird, suchen Menschen oft nur in "
		+"Registern in der Nähe. Ein Tier, das eine Grenze überquert, ist "
		+"schwerer zu finden.",
	"search.petQueryDescription":
		"PetQuery ist eine föderierte, Plugin-basierte Suche nach "
		+"Mikrochip-IDs von Tieren. Sie prüft konfigurierte Quellen "
		+"parallel und führt die Ergebnisse zusammen.",
	"Features":
		"Funktionen",
	"Parallel plugin search":
		"Parallele Plugin-Suche",
	"Search by image":
		"Bildersuche",
	"Federated and loop-safe":
		"Föderiert und schleifensicher",
	"Validated and protected":
		"Validiert und geschützt",
	"Validated I/O":
		"Validierte Ein- und Ausgabe",
	"Share helpful files":
		"Hilfreiche Dateien teilen",
	"Reunite pets and people":
		"Tiere und Menschen wieder zusammenbringen",
	"Build with the API":
		"Mit der API entwickeln",
	"Search connected registries":
		"Verbundene Register durchsuchen",
	"Magnifying glass connected to three pet registries":
		"Lupe, die mit drei Tierregistern verbunden ist",
	"search.registrySearchFeature":
		"Eine Mikrochip-ID wird parallel in allen aktivierten Plugins "
		+"geprüft. Eine langsame Quelle blockiert die anderen nicht.",
	"A pet photo matched against local records":
		"Ein Tierfoto wird mit lokalen Einträgen abgeglichen",
	"search.imageSearchFeature":
		"Hochgeladene Tierfotos lassen sich mit der integrierten "
		+"KI-Bildersuche mit lokalen Einträgen abgleichen.",
	"A document with a paw print and upload arrow":
		"Ein Dokument mit Pfotenabdruck und Upload-Pfeil",
	"search.fileSharingFeature":
		"Wenn eine reine Textsuche nicht ausreicht, können Fotos oder "
		+"Dokumente auch an konfigurierte Plugins übergeben werden.",
	"Connected PetQuery servers sharing search results":
		"Verbundene PetQuery-Server teilen Suchergebnisse",
	"search.loopSafeFeature":
		"Server können einander abfragen, ohne Datenbanken zu teilen. "
		+"Eine Routenverfolgung hilft, Abfrageschleifen zu verhindern.",
	"API brackets surrounding a paw print":
		"API-Klammern umschließen einen Pfotenabdruck",
	"search.validationFeature":
		"Eingehende und entfernte Daten werden validiert. "
		+"Verwaltungsendpunkte erfordern eine entsprechende Anmeldung.",
	"Two paws connected by a heart":
		"Zwei Pfoten, verbunden durch ein Herz",
	"search.reunionFeature":
		"Lokale Einträge und vertrauenswürdige verbundene Server können "
		+"aus einem vielversprechenden Treffer ein glückliches Wiedersehen "
		+"machen.",
	"API code brackets surrounding a paw print":
		"API-Codeklammern umschließen einen Pfotenabdruck",
	"search.apiFeature":
		"Nutzen Sie die JSON-Endpunkte, um PetQuery-Suchen in Ihre "
		+"Website, Abläufe im Tierheim oder Rettungswerkzeuge einzubinden.",
	"How it works":
		"So funktioniert es",
	"1. Send a query":
		"1. Anfrage senden",
	"Enter a chip ID, add a photo, or do both.":
		"Geben Sie eine Chip-ID ein, fügen Sie ein Foto hinzu oder "
		+"beides.",
	"Registry plugins":
		"Register-Plugins",
	"Local records and AI image search":
		"Lokale Einträge und KI-Bildersuche",
	"Connected PetQuery servers":
		"Verbundene PetQuery-Server",
	"2. Get combined results":
		"2. Gemeinsame Ergebnisse erhalten",
	"Matches return together in one response.":
		"Treffer werden gemeinsam in einer Antwort zurückgegeben.",
	"Found {count} result":
		"{count} Ergebnis gefunden",
	"Found {count} results":
		"{count} Ergebnisse gefunden",
	"Complete":
		"Vollständig",
	"Partial":
		"Teilweise",
	"Some registries reported errors":
		"Einige Register haben Fehler gemeldet",
	"No matching pet was found.":
		"Kein passendes Tier gefunden.",
	"Distance":
		"Entfernung",
	"No last seen location":
		"Kein letzter Sichtungsort",
	"Last seen":
		"Zuletzt gesehen",
	"Enable your location to calculate":
		"Aktivieren Sie Ihren Standort, um die Entfernung zu berechnen.",
	"Last seen contact":
		"Kontakt zur letzten Sichtung",
	"Report last seen":
		"Letzte Sichtung melden",
	"Preview from {source}":
		"Vorschau von {source}",
	"Last seen saved.":
		"Letzte Sichtung gespeichert.",
	"This publicly updates the pet immediately on":
		"Dies aktualisiert den Tiereintrag sofort öffentlich auf",
	"Your contact details will be visible in search results.":
		"Ihre Kontaktdaten werden in den Suchergebnissen angezeigt.",
	"The sighting time is set to the moment you save.":
		"Der Sichtungszeitpunkt wird auf den Speicherzeitpunkt gesetzt.",
	"Refresh my current location":
		"Meinen aktuellen Standort aktualisieren",
	"Your current location is pre-selected. Click the map to adjust it.":
		"Ihr aktueller Standort ist vorausgewählt. Klicken Sie auf die "
		+"Karte, um ihn anzupassen.",
	"Latitude":
		"Breitengrad",
	"Longitude":
		"Längengrad",
	"Contact name":
		"Kontaktname",
	"Contact email":
		"Kontakt-E-Mail",
	"Contact phone":
		"Kontakttelefon",
	"Save public sighting":
		"Öffentliche Sichtung speichern",
	"Your browser does not support geolocation.":
		"Ihr Browser unterstützt keine Standortbestimmung.",
	"Location unavailable: {message}":
		"Standort nicht verfügbar: {message}",
	"Map: click to set the sighting location":
		"Karte: Klicken Sie, um den Sichtungsort festzulegen",
	"logs.requestPrivacy":
		"Es werden bis zu 100 neueste Anfragen angezeigt. Query-Strings "
		+"und Inhalte werden nicht protokolliert.",
	"Showing up to 100 newest log entries.":
		"Es werden bis zu 100 neueste Protokolleinträge angezeigt.",
	"Level":
		"Stufe",
	"All levels":
		"Alle Stufen",
	"Search request lines":
		"Anfragezeilen durchsuchen",
	"Search message":
		"Nachricht durchsuchen",
	"Loading...":
		"Wird geladen...",
	"Search requests":
		"Anfragen durchsuchen",
	"Search logs":
		"Protokolle durchsuchen",
	"No matching request logs.":
		"Keine passenden Anfrageprotokolle gefunden.",
	"No matching log entries.":
		"Keine passenden Protokolleinträge gefunden.",
	"error":
		"Fehler",
	"warn":
		"Warnung",
	"info":
		"Info",
	"debug":
		"Debug",
	"users":
		"Benutzer",
	"pets":
		"Tiere",
	"servers":
		"Server",
	"favicon":
		"Favicon",
	"url":
		"URL",
	"name":
		"Name",
	"API client token":
		"API-Client-Token",
	"Clients send one of these as":
		"Clients senden eines davon als",
	"At least 16 printable characters, no spaces.":
		"Mindestens 16 druckbare Zeichen, keine Leerzeichen.",
	"They cannot sign in to the admin GUI.":
		"Sie können sich nicht an der Admin-GUI anmelden.",
};
