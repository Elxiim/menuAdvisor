import { green, orange, red } from '@material-ui/core/colors';
import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  Image,
  Svg,
  Path,
} from '@react-pdf/renderer';
import React from 'react';
import Command from '../../models/Command.model';
import { estimateCommandPrice } from '../../services/price';
import DateFormatter from '../../utils/DateFormatter';
import NumberFormatter from '../../utils/NumberFormatter';
import PriceFormatter from '../../utils/PriceFormatter';

interface PDFCommandProps {
  command: Command;
}

const styles = StyleSheet.create({
  body: {
    paddingTop: 35,
    paddingHorizontal: 35,
    paddingBottom: 65,
    fontFamily: 'Oswald',
    fontSize: 13,
  },
  heading: {
    borderTop: '1px solid grey',
    borderBottom: '1px solid grey',
    paddingVertical: 4,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  customerInformation: {
    marginVertical: 6,
    display: 'flex',
    flexDirection: 'row',
  },
  commandCode: {
    color: orange[400],
  },
  commandStatus: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 1000,
    color: 'white',
    backgroundColor: orange[400],
    fontSize: 12,
  },
  validated: {
    backgroundColor: green[400],
  },
  revoked: {
    backgroundColor: red[400],
  },
  pageNumber: {
    position: 'absolute',
    fontSize: 12,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: 'grey',
  },
  bold: {
    fontWeight: 'bold',
  },
  column: {
    display: 'flex',
    flexDirection: 'column',
  },
  divider: {
    marginVertical: 8,
    borderBottom: '1px solid grey',
  },
  imageCircle: {
    borderRadius: '50%',
    width: 30,
    height: 30,
  },
  restaurantImage: {
    width: 80,
    height: 80,
  },
  itemContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 30,
  },
  optionsContainer: {
    paddingLeft: 40,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  verticalSpacer: {
    height: 6,
  },
  option: {},
});

Font.register({
  family: 'Oswald',
  src: 'https://fonts.gstatic.com/s/oswald/v13/Y_TKV6o8WovbUd3m_X9aAA.ttf',
});

const PDFCommand: React.FC<PDFCommandProps> = ({ command }) => {
  return (
    <Document
      title={`Commande numéro ${NumberFormatter.format(command.code, {
        minimumIntegerDigits: 6,
      })}`}
      author="Menu advisor"
    >
      <Page style={styles.body}>
        <View
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <Image
            src={command.restaurant.imageURL}
            style={[styles.imageCircle, styles.restaurantImage]}
          />
          <View style={{ width: 16 }} />
          <View style={{ display: 'flex', flexDirection: 'column' }}>
            <Text style={{ fontSize: 20 }}>{command.restaurant.name}</Text>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <Svg width="24" height="24">
                <Path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"
                  stroke="black"
                />
              </Svg>
              <Text style={{ fontWeight: 'bold', fontSize: 16, marginTop: -4 }}>
                {command.restaurant.address}
              </Text>
            </View>
            <View
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: 6,
              }}
            >
              <Svg width="24" height="24">
                <Path
                  d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"
                  stroke="black"
                />
              </Svg>
              <Text style={{ fontSize: 13 }}>
                {command.restaurant.phoneNumber}
              </Text>
            </View>
          </View>
        </View>
        <View style={styles.heading}>
          <View
            style={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Text style={{ marginRight: 6 }}>Numéro de commande:</Text>
            <Text style={styles.commandCode}>
              {NumberFormatter.format(command.code, {
                minimumIntegerDigits: 6,
              })}
            </Text>
          </View>
          <Text
            style={[
              styles.commandStatus,
              command.validated
                ? styles.validated
                : command.revoked
                ? styles.revoked
                : {},
            ]}
          >
            {command.validated
              ? 'Validée'
              : command.revoked
              ? 'Refusée'
              : 'En attente'}
          </Text>
        </View>
        <View style={styles.customerInformation}>
          <View style={styles.column}>
            <Text style={styles.bold}>Nom et prénom</Text>
            <Text style={styles.bold}>Téléphone</Text>
            {command.commandType === 'delivery' && (
              <>
                <Text style={styles.bold}>Adresse de livraison</Text>
                <Text style={styles.bold}>Type de livraison</Text>
                <Text style={styles.bold}>Date et heure de livraison</Text>
                <Text style={styles.bold}>Paiement</Text>
              </>
            )}
            {command.commandType === 'takeaway' && (
              <>
                <Text style={styles.bold}>Date et heure de retrait</Text>
              </>
            )}
          </View>
          <View style={{ width: 32 }} />
          <View style={styles.column}>
            <Text>
              {command.relatedUser
                ? `${command.relatedUser.name.first} ${command.relatedUser.name.last}`
                : command.customer
                ? `${command.customer.name}`
                : 'Non défini'}
            </Text>
            <Text>
              {command.relatedUser
                ? command.relatedUser.phoneNumber
                : command.customer
                ? command.customer.phoneNumber
                : 'Non défini'}
            </Text>
            {command.commandType === 'delivery' && (
              <>
                <Text>{command.shippingAddress}</Text>
                <Text>
                  {command.optionLivraison === 'behind_the_door'
                    ? 'Derrière la porte'
                    : command.optionLivraison === 'on_the_door'
                    ? 'Devant la porte'
                    : "À l'extérieur"}
                </Text>
                <Text>{DateFormatter.format(command.shippingTime, true)}</Text>
                <Text>{`${
                  command.paiementLivraison
                    ? 'À la livraison'
                    : 'Avant la livraison'
                } - ${command.payed.status ? 'Payé' : 'Non payé'}`}</Text>
              </>
            )}
            {command.commandType === 'takeaway' && (
              <>
                <Text>{DateFormatter.format(command.shippingTime, true)}</Text>
              </>
            )}
          </View>
        </View>

        <View style={styles.heading}>
          <Text>Type de commande</Text>
          <Text style={{ textTransform: 'uppercase' }}>
            {command.commandType === 'delivery'
              ? 'Livraison'
              : command.commandType === 'on_site'
              ? 'Sur place'
              : 'À emporter'}
          </Text>
        </View>

        <View
          style={{
            marginVertical: 6,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Text style={{ textDecoration: 'underline' }}>
            Détails de la commande
          </Text>
          <Text style={{ fontWeight: 'bold' }}>
            {command.priceless ? 'Sans prix' : 'Avec prix'}
          </Text>
        </View>

        {command.items.map(
          ({
            item: {
              _id,
              imageURL,
              price,
              name: { fr: name },
            },
            options,
            quantity,
          }) => (
            <React.Fragment key={_id}>
              <View style={styles.itemContainer}>
                <View style={styles.item}>
                  <Text
                    style={{ width: 30, fontSize: 12, textAlign: 'right' }}
                  >{`x ${quantity}`}</Text>
                  <Image
                    src={imageURL}
                    style={[styles.imageCircle, { marginHorizontal: 12 }]}
                  />
                  <Text style={{ flexGrow: 1 }}>{name}</Text>
                  {!!price.amount && (
                    <Text>{`PU: ${PriceFormatter.format(price)}`}</Text>
                  )}
                </View>
                <View style={styles.verticalSpacer} />
                {!!options.length && (
                  <View style={styles.optionsContainer}>
                    {options.map(
                      ({ title, items }) =>
                        !!items.length && (
                          <View
                            key={title}
                            style={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'stretch',
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 12,
                                textDecoration: 'underline',
                                fontWeight: 'bold',
                                marginBottom: 6,
                              }}
                            >
                              {title}
                            </Text>
                            {items.map(
                              ({
                                item: { _id, imageURL, name, price },
                                quantity,
                              }) => (
                                <React.Fragment key={_id}>
                                  <View
                                    style={{
                                      display: 'flex',
                                      flexDirection: 'row',
                                      alignItems: 'center',
                                    }}
                                  >
                                    <Text
                                      style={{
                                        width: 30,
                                        fontSize: 12,
                                        textAlign: 'right',
                                      }}
                                    >
                                      {`x ${quantity}`}
                                    </Text>
                                    <Image
                                      src={imageURL}
                                      style={[
                                        styles.imageCircle,
                                        {
                                          width: 20,
                                          height: 20,
                                          marginHorizontal: 6,
                                        },
                                      ]}
                                    />
                                    <Text style={{ fontSize: 12, flexGrow: 1 }}>
                                      {name}
                                    </Text>
                                    {!!price && !!price.amount && (
                                      <Text>{`PU: ${PriceFormatter.format(
                                        price,
                                      )}`}</Text>
                                    )}
                                  </View>
                                  <View style={styles.verticalSpacer} />
                                </React.Fragment>
                              ),
                            )}
                          </View>
                        ),
                    )}
                  </View>
                )}
              </View>
              <View style={styles.verticalSpacer} />
            </React.Fragment>
          ),
        )}

        {command.menus.map(
          ({
            foods,
            quantity,
            item: {
              _id,
              price,
              type,
              foods: foodsInMenu,
              name: { fr: name },
            },
          }) => {
            const fixedPrice = type === 'fixed_price',
              priceless = type === 'priceless';

            return (
              <React.Fragment key={_id}>
                <View style={styles.itemContainer}>
                  <View style={styles.item}>
                    <Text
                      style={{ width: 30, fontSize: 12, textAlign: 'right' }}
                    >{`x ${quantity}`}</Text>
                    <Text style={{ marginHorizontal: 12, flexGrow: 1 }}>
                      {name}
                    </Text>
                    {fixedPrice && (
                      <Text>{`PU: ${PriceFormatter.format(price)}`}</Text>
                    )}
                  </View>
                  {foods.map(
                    ({
                      food: {
                        _id,
                        imageURL,
                        name: { fr: name },
                        price,
                      },
                      options,
                    }) => {
                      const foodInMenu = foodsInMenu.find(
                        ({ food: f }) => f._id === _id,
                      );

                      return (
                        <View key={_id} style={styles.itemContainer}>
                          <View style={[styles.item, { paddingLeft: 40 }]}>
                            <Image
                              src={imageURL}
                              style={[
                                styles.imageCircle,
                                { width: 25, height: 25, marginRight: 12 },
                              ]}
                            />
                            <Text style={{ marginHorizontal: 12, flexGrow: 1 }}>
                              {name}
                            </Text>
                            {!priceless && (
                              <Text>{`${
                                !fixedPrice
                                  ? `PU: ${PriceFormatter.format(price)}`
                                  : ''
                              }${
                                fixedPrice &&
                                !!foodInMenu &&
                                !!foodInMenu.additionalPrice.amount
                                  ? ` + ${PriceFormatter.format(
                                      foodInMenu.additionalPrice,
                                    )}`
                                  : ''
                              }`}</Text>
                            )}
                          </View>
                          <View style={styles.verticalSpacer} />
                          {!!options.length && (
                            <View style={styles.optionsContainer}>
                              {options.map(
                                ({ title, items }) =>
                                  !!items.length && (
                                    <View
                                      key={title}
                                      style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'stretch',
                                      }}
                                    >
                                      <Text
                                        style={{
                                          fontSize: 12,
                                          textDecoration: 'underline',
                                          fontWeight: 'bold',
                                          marginBottom: 6,
                                        }}
                                      >
                                        {title}
                                      </Text>
                                      {items.map(
                                        ({
                                          item: { _id, imageURL, name, price },
                                          quantity,
                                        }) => (
                                          <React.Fragment key={_id}>
                                            <View
                                              style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                              }}
                                            >
                                              <Text
                                                style={{
                                                  width: 30,
                                                  fontSize: 12,
                                                  textAlign: 'right',
                                                }}
                                              >
                                                {`x ${quantity}`}
                                              </Text>
                                              <Image
                                                src={imageURL}
                                                style={[
                                                  styles.imageCircle,
                                                  {
                                                    width: 20,
                                                    height: 20,
                                                    marginHorizontal: 6,
                                                  },
                                                ]}
                                              />
                                              <Text
                                                style={{
                                                  fontSize: 12,
                                                  flexGrow: 1,
                                                }}
                                              >
                                                {name}
                                              </Text>
                                              {!!price && !!price.amount && (
                                                <Text>{`PU: ${PriceFormatter.format(
                                                  price,
                                                )}`}</Text>
                                              )}
                                            </View>
                                            <View
                                              style={styles.verticalSpacer}
                                            />
                                          </React.Fragment>
                                        ),
                                      )}
                                    </View>
                                  ),
                              )}
                            </View>
                          )}
                        </View>
                      );
                    },
                  )}
                </View>
                <View style={styles.verticalSpacer} />
              </React.Fragment>
            );
          },
        )}

        <View
          style={[
            styles.heading,
            { flexDirection: 'column', alignItems: 'stretch' },
          ]}
        >
          {command.commandType === 'delivery' && (
            <View
              style={[
                styles.heading,
                { paddingVertical: 0, borderTop: 'none', borderBottom: 'none' },
              ]}
            >
              <Text
                style={{
                  fontWeight: 'bold',
                }}
              >
                Prix de livraison
              </Text>
              <Text
                style={{ fontSize: 14, color: '#dc143c', fontWeight: 'bold' }}
              >
                {PriceFormatter.format(command.restaurant.deliveryPrice)}
              </Text>
            </View>
          )}
          <View
            style={[
              styles.heading,
              { paddingVertical: 0, borderTop: 'none', borderBottom: 'none' },
            ]}
          >
            <Text
              style={{
                fontWeight: 'bold',
              }}
            >
              Total
            </Text>
            <Text
              style={{ fontSize: 14, color: '#dc143c', fontWeight: 'bold' }}
            >
              {PriceFormatter.format({
                amount: estimateCommandPrice(command),
                currency: 'eur',
              })}
            </Text>
          </View>
        </View>

        <Text
          style={{
            fontSize: 14,
            fontWeight: 'bold',
            marginTop: 8,
            marginBottom: 2,
            textDecoration: 'underline',
          }}
        >
          Commentaire
        </Text>
        <Text
          style={{ fontSize: 12, color: !command.comment ? 'grey' : '#111111' }}
        >
          {command.comment || 'Aucun commentaire'}
        </Text>

        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) =>
            `${pageNumber} / ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};

export default PDFCommand;
