# Yacht & boat clubs

I wanted to create an easily accessible collection of yacht and boat club information. To be listed, a yacht or boat club needs only a name and a live official website (or Facebook page). Every other field is included when known.

The clublist.yml file contains a list of yachting and boating clubs, with the following information:

* Name
* City
* State (or province/region outside the US)
* Country
* Date founded (a year, `about <year>` if inexact, or `unknown`)
* Website
* Coordinates (`[latitude, longitude]`)
* Burgee (name of associated image file, omitted if no burgee was found)
* Description (what the burgee looks like, to help identify a club from its burgee, omitted with the burgee)

The images directory contains the burgee image for each club. Some yacht clubs across different states have the same name. In these cases, the state abbreviation has been added to the name.

I'm using the data to create a modern website listing clubs across the US. Visit [ycburgees.com](https://www.ycburgees.com).

## Website

`index.html` is a single-file site with a searchable club list and statistics. It reads `clublist.yml` and the `images` directory when it loads, so it needs a web server. Run `make serve`, then open <http://localhost:8000/>.

## Status

I'm focusing on clubs in the US first. Clubs in the following states have been added:

* Rhode Island
* Maine
* Vermont
* New Hampshire
* Connecticut
* Massachusetts
* New Jersey

## Contact & usage

If you are a member of a yacht or boat club who has stumbled on this page and would like to add or remove your club, correct any information, or provide a high quality burgee image for your club, email ycburgees@gmail.com

This data is here for anyone's convenience.
