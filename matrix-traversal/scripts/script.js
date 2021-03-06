/*global angular */

;(function() {
'use strict';

var APP = angular.module('app', [])

  , speed = 1000 / 4 // Timeout delay

  , field =
        [ [0, 0, 0, 0, 0, 0, 0]
        , [3, 0, 2, 0, 4, 2, 4]
        , [3, 3, 0, 0, 4, 2, 4]
        , [0, 0, 0, 0, 0, 0, 0]
        , [3, 1, 3, 0, 3, 3, 3]
        , [3, 1, 3, 0, 1, 3, 1]
        , [0, 0, 0, 0, 0, 0, 0]
    ]

APP.controller('ctrl', function($scope, $timeout, $q, $log) {
    $scope.type = 'DFS'

    $scope.currentLength = 0

    $scope.isAnimating = false

    $scope.matrix = field.map(function(row) {
        return row.map(function(cell) {
            return { value: cell, visited: false }
        })
    })

    $scope.traverse = (function() {
        var directions = [ [1, 0], [0, 1], [-1, 0], [0, -1] ]

          , list = []

          , deferred = null

        function start() {
            if ($scope.isAnimating)
                throw new Error('Animation in progress!')

            $scope.isAnimating = true
            console.group('Traverse: ' + $scope.type)

            deferred = $q.defer()

            deferred.promise.then(function() {
                $scope.isAnimating = false
                console.groupEnd()
            })
        }

        function reset() {
            $scope.currentLength = 0

            $scope.matrix.forEach(function(row) {
                row.forEach(function(cell) {
                    cell.visited = false
                })
            })
        }

        function isInside(row, col) {
            return 0 <= row && row < $scope.matrix.length &&
                   0 <= col && col < $scope.matrix[row].length
        }

        function isNext(row, col, value) {
            return isInside(row, col) && $scope.matrix[row][col].value === value
        }

        function visit(row, col) {
            $log.log(row, col)

            $scope.currentLength++

            $scope.matrix[row][col].visited = true
        }

        function traverse(row, col) {
            list.push([row, col])

            // Recursive while loop with timeout
            ;(function loop() {
                if (!list.length) return deferred.resolve() // Condition

                var current = list[{ 'DFS': 'pop', 'BFS': 'shift' }[$scope.type]]()
                  , cell = $scope.matrix[current[0]][current[1]]

                if (cell.visited) return loop() // Continue

                visit(current[0], current[1])

                directions.forEach(function(direction) {
                    var nextRow = current[0] + direction[0]
                      , nextCol = current[1] + direction[1]

                    if (isNext(nextRow, nextCol, cell.value))
                        list.push([nextRow, nextCol])
                })

                $timeout(loop, speed) // Afterthought
            }())
        }

        return function(row, col) {
            start(), reset(), traverse(row, col)
        }
    }())
})
}())
