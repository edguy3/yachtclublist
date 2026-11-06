# Yacht & boat clubs

Browse the data at <https://edguy3.github.io/yachtclublist/>

Around 2024, original author Devin Beliveau wanted to create an easily accessible collection of yacht and boat club information. In 2026, while making a cruiser contest web page for Liberty Yacht Club, Ed Guy leveraged this page for that work. Since that time, the project has grown further, greatly expanding the number of clubs listed and the functionality.

To be listed, a yacht or boat club needs only a name and a live official website (or Facebook page). Every other field is included when known.

The clublist.yml file contains a list of yachting and boating clubs, with the following information:

* Name
* UUID (a permanent unique identifier for the club)
* City
* State (or province/region outside the US)
* Country
* Date founded (a year, `about <year>` if inexact, or `unknown`)
* Website
* Coordinates (`[latitude, longitude]`)
* Burgee (name of associated image file, omitted if no burgee was found)
* Description (what the burgee looks like, to help identify a club from its burgee, omitted with the burgee)

The images directory contains the burgee image for each club. Some yacht clubs across different states have the same name. In these cases, the state abbreviation has been added to the name.

Devin Beliveau used the data to create a modern website listing clubs across the US. Visit [ycburgees.com](https://www.ycburgees.com).

## Website

`index.html` is a single-file site with a searchable club list and statistics. It reads `clublist.yml` and the `images` directory when it loads, so it needs a web server. Run `make serve`, then open <http://localhost:8000/>.

## Status

Devin Beliveau focused on clubs in the US first. The list now covers clubs worldwide, in 43 countries and territories:

* North America: USA, Canada, Mexico
* Central America and the Caribbean: Antigua and Barbuda, Bahamas, Barbados, Honduras
* Europe: Croatia, Denmark, Finland, France, Germany, Iceland, Ireland, Isle of Man, Italy, Malta, Monaco, Norway, Poland, Portugal, Spain, Sweden, Switzerland, United Kingdom
* Asia: Brunei, China, India, Malaysia, Philippines, Singapore, Sri Lanka, Thailand
* Middle East: Saudi Arabia, Turkey, United Arab Emirates
* Africa and the South Atlantic: Egypt, Saint Helena, South Africa
* Oceania: Australia, Marshall Islands, New Zealand, Papua New Guinea

## Contact & usage

If you are a member of a yacht or boat club who has stumbled on this page and would like to add or remove your club, correct any information, or provide a high quality burgee image for your club, [open an issue](https://github.com/edguy3/yachtclublist/issues/new) or [make a pull request](https://github.com/edguy3/yachtclublist/pulls).

This is open source data, here for anyone's convenience and released under the [MIT License](LICENSE). The MIT License covers the data and code. Burgee images and crests are not covered: they remain the property of their clubs, and any club can ask to have its image removed by opening an issue.
