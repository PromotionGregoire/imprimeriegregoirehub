import React, { useState } from 'react'
import { AdvancedDatePicker } from '@/components/ui/advanced-date-picker'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function DatePickerDemo() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>()
  const [selectedDateTime, setSelectedDateTime] = useState<Date | undefined>()

  return (
    <div className="space-y-6 p-6">
      <h2 className="text-2xl font-bold">Démonstration du Calendrier Avancé</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Sélecteur de Date Simple</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdvancedDatePicker
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Choisir une date"
            />
            {selectedDate && (
              <div className="text-sm text-muted-foreground">
                Date sélectionnée: {selectedDate.toLocaleDateString('fr-FR')}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sélecteur de Date et Heure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <AdvancedDatePicker
              value={selectedDateTime}
              onChange={setSelectedDateTime}
              placeholder="Choisir une date et heure"
              includeTime={true}
            />
            {selectedDateTime && (
              <div className="text-sm text-muted-foreground">
                Date et heure sélectionnées: {selectedDateTime.toLocaleString('fr-FR')}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fonctionnalités</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li>✅ Navigation hiérarchique : Jour → Mois → Année</li>
            <li>✅ Interface intuitive avec transitions fluides</li>
            <li>✅ Sélection de date simple ou avec heure</li>
            <li>✅ Design épuré et minimaliste "Uber Base"</li>
            <li>✅ Indicateurs visuels pour la date d'aujourd'hui et la date sélectionnée</li>
            <li>✅ Navigation rapide entre années et mois</li>
            <li>✅ Animations hover et micro-interactions</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}