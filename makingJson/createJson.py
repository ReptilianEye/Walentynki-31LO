import csv,json

answers = {}
def readData(source,destination):
    with open(source + 'answers.csv', encoding='utf8') as file:
        csvReader = csv.DictReader(file)
        i = 0
        for rows in csvReader:
            rows.pop('Timestamp')
            if rows.get('forma') != 'Prywatna (zostanie wysłana bezpośrednio do odbiorcy)':
                answers[i] = rows
                i += 1

    with open(destination + 'answers.json', 'w+', encoding='utf-8') as jsonf:
        jsonf.write(json.dumps(answers,indent=4,ensure_ascii=True))
        
        
sourceFolder = 'makingJson/'
destinationFolder = 'data/'
readData(sourceFolder,destinationFolder)
