# AWS CloudTrail Athena pretty logs

It's pretty cool to have Athena querying your CloudTrail Logs. The only issue is sometimes it's hard to track results since the output is somewhat raw. This small tool formats the output making it more human readable.
![Screen Shot 2021-03-26 at 4 53 39 PM](https://repository-images.githubusercontent.com/513657902/85d15f89-3b1b-4c8f-9b18-2c1be89f354d)

## Usage

#### 1. Clone this repository (in the command line)

```bash
git clone https://github.com/rooty0/CloudTrail-Athena-pretty-logs.git
cd CloudTrail-Athena-pretty-logs.git
mkdir realdata
```

#### 2. Execute your Athena query, click `Download results` button 

#### 3. Download your CSV result file to the `realdata/` folder

#### 4. Run it (see Quick or Manual method)

##### Quick
This is tested on MacOS. Just run from console:
```shell
./run.sh
```
The script starts Python server and opens your web browser

If this is not working for you just follow steps below 

##### Manual
You can run this using the following python command:

```bash
python -m SimpleHTTPServer
```

...or with Python 3:

```bash
python -m http.server
```

navigate to http://localhost:8000/cloudtrail.html

#### 5. The page you open will be blank. You need to type the file name to "Data read from file" box to load your results

## Dependencies

* [Bootstrap 4](http://getbootstrap.com/) - Responsive HTML, CSS and Javascript framework
* [jQuery](https://jquery.com/) - a fast, small, and feature-rich JavaScript library
* [jQuery CSV](https://github.com/evanplaice/jquery-csv/) - Parse CSV (Comma Separated Values) to Javascript arrays or dictionaries.
* [DataTables](http://datatables.net/) - add advanced interaction controls to any HTML table.
* [JavaScript Cookie](https://github.com/js-cookie/js-cookie) - A simple, lightweight JavaScript API for handling browser cookies
* [Moment.js](https://momentjs.com/) - Parse, validate, manipulate, and display dates in javascript.

## Other Contributors 

* [Derek Eder](http://derekeder.com) - [CSV to HTML Table](https://github.com/derekeder/csv-to-html-table/)
* [ychaouche](https://github.com/ychaouche) - [javascript tag fixes](https://github.com/derekeder/csv-to-html-table/pull/30)
* [Freddy Martinez](https://github.com/b-meson) - [localized javascript libraries](https://github.com/derekeder/csv-to-html-table/pull/17)
* [Sergey Ponomarev](https://github.com/stokito) - [CSV escaped in HTML output](https://github.com/derekeder/csv-to-html-table/pull/60)
* [djibe](https://github.com/djibe) - [Bootstrap 4 and latest DataTables](https://github.com/djibe/csv-to-html-table)

