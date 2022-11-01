import pandas as pd
import sys
iris = pd.read_csv('IRIS.csv')
df = pd.DataFrame(iris)
from sklearn.model_selection import train_test_split
X = df.drop(['species'], axis='columns')
y = df.species
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=1)
from sklearn.neighbors import KNeighborsClassifier
knn = KNeighborsClassifier(n_neighbors=3)
knn.fit(X_train, y_train)
from sklearn.metrics import accuracy_score, confusion_matrix
predict=knn.predict(X_test)
l=[[float(sys.argv[1]),float(sys.argv[2]),float(sys.argv[3]),float(sys.argv[4])]]
prediction=knn.predict(l)
print(prediction)
print(accuracy_score(predict,y_test))
print(confusion_matrix(predict,y_test))